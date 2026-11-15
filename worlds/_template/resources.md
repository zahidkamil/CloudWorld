# AWS resource looks: Your World Name

Entry format (one line per entry, exactly this shape):

```
- `<key>` | model: `<file>.glb` | <status> | <how it looks>
```

- `<key>`: `structure:*`, `family:*`, or an AWS service key such as `aws_instance`.
- `<status>`: `planned` (not modelled yet) or `built` (the `.glb` exists in `public/worlds/<id>/models/`).
- File names are kebab-case and unique within the world. Several keys may share one file.
- Describe silhouette, materials, colours, and details in enough words that someone else could model it.
  Mention how selected, highlighted, and dimmed states should read if they are unusual.

Required keys: the 4 `structure:*` entries and the 12 `family:*` entries below. Add service keys under
"Key services" for the 10 or so most recognizable AWS services. Any other `aws_*` type uses its family.

## Structure

- `structure:region` | model: `region-island.glb` | planned | ...
- `structure:az` | model: `az-district.glb` | planned | ...
- `structure:vpc` | model: `vpc-boundary.glb` | planned | ...
- `structure:subnet` | model: `subnet-lot.glb` | planned | ...

## Families

- `family:compute` | model: `compute.glb` | planned | virtual servers, Auto Scaling, EC2-like
- `family:containers` | model: `containers.glb` | planned | ECS, EKS, ECR
- `family:serverless` | model: `serverless.glb` | planned | Lambda-like, Step Functions
- `family:database` | model: `database.glb` | planned | RDS, Aurora, DynamoDB, ElastiCache
- `family:storage` | model: `storage.glb` | planned | S3, EBS, EFS, Backup
- `family:gateway` | model: `gateway.glb` | planned | API Gateway, Transit Gateway, VPC endpoints
- `family:loadbalancer` | model: `loadbalancer.glb` | planned | ALB, NLB, target groups
- `family:edge` | model: `edge.glb` | planned | CloudFront, Route 53, WAF
- `family:messaging` | model: `messaging.glb` | planned | SQS, SNS, EventBridge, Kinesis
- `family:security` | model: `security.glb` | planned | KMS, Secrets Manager, IAM family
- `family:monitoring` | model: `monitoring.glb` | planned | CloudWatch, logs, alarms
- `family:generic` | model: `generic.glb` | planned | any other `aws_*` resource

## Key services

- `aws_instance` | model: `ec2-instance.glb` | planned | ...
- `aws_s3_bucket` | model: `s3-bucket.glb` | planned | ...
- `aws_db_instance` | model: `rds-instance.glb` | planned | ...
- `aws_lambda_function` | model: `lambda-function.glb` | planned | ...
- `aws_lb` | model: `load-balancer.glb` | planned | ...
- `aws_nat_gateway` | model: `nat-gateway.glb` | planned | ...
- `aws_internet_gateway` | model: `internet-gateway.glb` | planned | ...
- `aws_security_group` | model: `security-group.glb` | planned | ...
- `aws_iam_role` | model: `iam-role.glb` | planned | ...
- `aws_kms_key` | model: `kms-key.glb` | planned | ...
