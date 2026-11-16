variable "environment" {
  type    = string
  default = "prod"
}

locals {
  east_azs = ["us-east-1a", "us-east-1b", "us-east-1c"]
  west_azs = ["us-west-2a", "us-west-2b", "us-west-2c"]
  ami      = "ami-0abcdef1234567890"
}

# ---------- Global ----------
resource "aws_iam_role" "app" {
  name = "cloudworld-app"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_route53_zone" "main" {
  name = "cloudworld.example.com"
}

# ---------- us-east-1 ----------
module "network_east" {
  source      = "./modules/network"
  name        = "east"
  cidr_block  = "10.0.0.0/16"
  azs         = local.east_azs
  environment = var.environment
}

resource "aws_security_group" "web_east" {
  name   = "web-east"
  vpc_id = module.network_east.vpc_id
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "web-east" }
}

resource "aws_security_group" "db_east" {
  name   = "db-east"
  vpc_id = module.network_east.vpc_id
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web_east.id]
  }
  tags = { Name = "db-east" }
}

resource "aws_kms_key" "east" {
  description = "East data key"
}

resource "aws_instance" "web_east" {
  count                  = 3
  ami                    = local.ami
  instance_type          = "t3.micro"
  availability_zone      = local.east_azs[count.index]
  subnet_id              = module.network_east.private_subnet_ids[count.index]
  vpc_security_group_ids = [aws_security_group.web_east.id]
  tags                   = { Name = "web-east-${count.index}" }
}

resource "aws_lb" "east" {
  name               = "web-east"
  load_balancer_type = "application"
  subnets            = module.network_east.public_subnet_ids
  security_groups    = [aws_security_group.web_east.id]
}

resource "aws_lb_target_group" "east" {
  name     = "web-east"
  port     = 443
  protocol = "HTTPS"
  vpc_id   = module.network_east.vpc_id
}

resource "aws_lb_target_group_attachment" "east" {
  count            = 3
  target_group_arn = aws_lb_target_group.east.arn
  target_id        = aws_instance.web_east[count.index].id
}

resource "aws_db_subnet_group" "east" {
  name       = "db-east"
  subnet_ids = module.network_east.private_subnet_ids
}

resource "aws_db_instance" "east" {
  identifier                  = "orders-east"
  engine                      = "postgres"
  instance_class              = "db.t3.micro"
  allocated_storage           = 20
  username                    = "app"
  manage_master_user_password = true
  multi_az                    = true
  storage_encrypted           = true
  kms_key_id                  = aws_kms_key.east.arn
  db_subnet_group_name        = aws_db_subnet_group.east.name
  vpc_security_group_ids      = [aws_security_group.db_east.id]
  skip_final_snapshot         = true
}

resource "aws_s3_bucket" "assets" {
  for_each = toset(["logs", "assets", "backups"])
  bucket   = "cloudworld-${each.key}-east"
}

resource "aws_lambda_function" "worker" {
  function_name = "worker-east"
  role          = aws_iam_role.app.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  filename      = "handler.zip"
  vpc_config {
    subnet_ids         = module.network_east.private_subnet_ids
    security_group_ids = [aws_security_group.web_east.id]
  }
}

# ---------- us-west-2 ----------
module "network_west" {
  source      = "./modules/network"
  name        = "west"
  cidr_block  = "10.1.0.0/16"
  azs         = local.west_azs
  environment = var.environment
  providers   = { aws = aws.west }
}

resource "aws_security_group" "web_west" {
  provider = aws.west
  name     = "web-west"
  vpc_id   = module.network_west.vpc_id
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "web-west" }
}

resource "aws_instance" "web_west" {
  provider               = aws.west
  count                  = 2
  ami                    = local.ami
  instance_type          = "t3.micro"
  availability_zone      = local.west_azs[count.index]
  subnet_id              = module.network_west.private_subnet_ids[count.index]
  vpc_security_group_ids = [aws_security_group.web_west.id]
  tags                   = { Name = "web-west-${count.index}" }
}

resource "aws_dynamodb_table" "sessions" {
  provider     = aws.west
  name         = "sessions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_sqs_queue" "jobs" {
  provider = aws.west
  name     = "jobs"
}
