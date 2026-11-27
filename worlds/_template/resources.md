# AWS resource looks: Your World Name

Entry format (one line per entry, exactly this shape):

```
- `<key>` | model: `<file>.glb` | <status> | <how it looks>
```

- `<key>`: `structure:*`, `family:*`, an AWS service key such as `aws_instance`, a size tier such as
  `aws_instance.large`, or a decorative prop such as `prop:food-cart`.
- `<status>`: `planned` (not modelled yet) or `built` (the `.glb` exists in `public/worlds/<id>/models/`).
- File names are kebab-case, unique within the world, and never copied from another world. Several keys may
  share one file.
- **Write vivid imagery (40+ characters, the validator checks).** Each look is a small scene someone could
  model without asking: the silhouette (what it is, tiers, roofs, towers), materials and colours with the
  world palette, three or four signature details (signs, lamps, props around it), what glows, and a short
  metaphor for what the AWS resource does ("a food truck that opens only when invoked"). Big, important
  services get big, unmistakable landmarks; small plumbing resources get small street furniture.

  Too thin: `Office building for EC2.`
  Good: `A four-storey red-brick walk-up with lit sash windows, a black iron fire escape zig-zagging down the
front, a green-awning deli and a wooden water tower on stilts.`

Required keys: the 4 `structure:*` entries and the 12 `family:*` entries below. Add service keys under
"Key services" for the 10 or so most recognizable AWS services. Any other `aws_*` type uses its family.

## Structure

- `structure:region` | model: `region-marker.glb` | planned | ...
- `structure:az` | model: `az-marker.glb` | planned | ...
- `structure:vpc` | model: `vpc-gate.glb` | planned | ...
- `structure:subnet` | model: `subnet-yard.glb` | planned | ...

## Families

- `family:compute` | model: `compute.glb` | planned | virtual servers, Auto Scaling, EC2-like
- `family:containers` | model: `containers.glb` | planned | ECS, EKS, ECR
- `family:serverless` | model: `serverless.glb` | planned | Lambda-like, Step Functions
- `family:database` | model: `database.glb` | planned | RDS, Aurora, DynamoDB, ElastiCache. Make it big and round or industrial.
- `family:storage` | model: `storage.glb` | planned | S3, EBS, EFS, Backup
- `family:gateway` | model: `gateway.glb` | planned | API Gateway, Transit Gateway, VPC endpoints
- `family:loadbalancer` | model: `loadbalancer.glb` | planned | ALB, NLB, target groups
- `family:edge` | model: `edge.glb` | planned | CloudFront, Route 53, WAF
- `family:messaging` | model: `messaging.glb` | planned | SQS, SNS, EventBridge, Kinesis
- `family:security` | model: `security.glb` | planned | KMS, Secrets Manager, IAM family
- `family:monitoring` | model: `monitoring.glb` | planned | CloudWatch, logs, alarms
- `family:generic` | model: `generic.glb` | planned | any other `aws_*` resource

## EC2 by instance size

The renderer reads `instance_type` (or `instance_class`) and picks a tier: nano and micro are tiny, small
and medium are small, large and xlarge are large, 2xlarge and up (or metal) are huge. A missing tier falls
back to `aws_instance`. Make the four buildings grow clearly in height and grandeur.

- `aws_instance.tiny` | model: `ec2-tiny.glb` | planned | ...
- `aws_instance.small` | model: `ec2-small.glb` | planned | ...
- `aws_instance.large` | model: `ec2-large.glb` | planned | ...
- `aws_instance.huge` | model: `ec2-huge.glb` | planned | ...

## Key services

- `aws_instance` | model: `ec2-small.glb` | planned | ...
- `aws_s3_bucket` | model: `s3-bucket.glb` | planned | ...
- `aws_db_instance` | model: `rds-instance.glb` | planned | ...
- `aws_dynamodb_table` | model: `dynamodb-table.glb` | planned | ...
- `aws_lambda_function` | model: `lambda-function.glb` | planned | ...
- `aws_lb` | model: `load-balancer.glb` | planned | ...
- `aws_nat_gateway` | model: `nat-gateway.glb` | planned | ...
- `aws_internet_gateway` | model: `internet-gateway.glb` | planned | ...
- `aws_security_group` | model: `security-group.glb` | planned | ...
- `aws_iam_role` | model: `iam-role.glb` | planned | ...
- `aws_kms_key` | model: `kms-key.glb` | planned | ...

## Street props (decoration only, never resources)

Listed in `library.json` `props` with a placement: `road` (in the ring lane), `sidewalk` (facing the block)
or `lot` (empty landmark cells). They bring the world to life between resources.

- `prop:vehicle` | model: `prop-vehicle.glb` | planned | ...
- `prop:street-life` | model: `prop-street-life.glb` | planned | ...
- `prop:lot-filler` | model: `prop-lot-filler.glb` | planned | ...
