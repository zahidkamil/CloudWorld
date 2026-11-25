# A small web application that lives entirely in one availability zone (us-east-1a).
# No modules: every resource is declared directly, which also exercises the root-module path.

locals {
  az  = "us-east-1a"
  ami = "ami-0abcdef1234567890"
}

# ---------- Global ----------
resource "aws_iam_role" "app" {
  name = "single-az-app"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# ---------- Network ----------
resource "aws_vpc" "main" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "single-az-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "single-az-igw" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  availability_zone       = local.az
  cidr_block              = "10.20.1.0/24"
  map_public_ip_on_launch = true
  tags                    = { Name = "single-az-public" }
}

resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  availability_zone = local.az
  cidr_block        = "10.20.2.0/24"
  tags              = { Name = "single-az-private" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "single-az-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ---------- Security groups (shared by several resources) ----------
resource "aws_security_group" "web" {
  name   = "single-az-web"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "single-az-web" }
}

resource "aws_security_group" "app" {
  name   = "single-az-app"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }
  tags = { Name = "single-az-app" }
}

# ---------- Compute and load balancing ----------
resource "aws_instance" "app" {
  count                  = 2
  ami                    = local.ami
  instance_type          = "t3.micro"
  availability_zone      = local.az
  subnet_id              = aws_subnet.private.id
  vpc_security_group_ids = [aws_security_group.app.id]
  tags                   = { Name = "single-az-app-${count.index}" }
}

resource "aws_lb" "front" {
  name               = "single-az-front"
  load_balancer_type = "network"
  subnets            = [aws_subnet.public.id]
}

resource "aws_lb_target_group" "app" {
  name     = "single-az-app"
  port     = 8080
  protocol = "TCP"
  vpc_id   = aws_vpc.main.id
}

resource "aws_lb_target_group_attachment" "app" {
  count            = 2
  target_group_arn = aws_lb_target_group.app.arn
  target_id        = aws_instance.app[count.index].id
}

resource "aws_lambda_function" "processor" {
  function_name = "single-az-processor"
  role          = aws_iam_role.app.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  filename      = "handler.zip"
  vpc_config {
    subnet_ids         = [aws_subnet.private.id]
    security_group_ids = [aws_security_group.app.id]
  }
}

# ---------- Data and integration ----------
resource "aws_kms_key" "data" {
  description = "Single-AZ data key"
}

resource "aws_s3_bucket" "assets" {
  for_each = toset(["uploads", "reports"])
  bucket   = "single-az-${each.key}"
}

resource "aws_dynamodb_table" "orders" {
  name         = "single-az-orders"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.data.arn
  }
}

resource "aws_sqs_queue" "orders" {
  name              = "single-az-orders"
  kms_master_key_id = aws_kms_key.data.arn
}
