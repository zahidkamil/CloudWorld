# Samples

`terraform/multi-region` is the configuration behind the bundled plan `src/samples/multi-region.plan.json`
(2 regions, 3 AZs each, a reusable network module, `count`, `for_each`, shared security groups).
It uses mock credentials, so no AWS account is needed.

Regenerate the plan:

```sh
cd samples/terraform/multi-region
terraform init -backend=false
terraform plan -out=tfplan
terraform show -json tfplan | node -e "process.stdout.write(JSON.stringify(JSON.parse(require('fs').readFileSync(0))))" > ../../../src/samples/multi-region.plan.json
rm tfplan
```

`terraform/single-az` is the configuration behind `src/samples/single-az.plan.json`: one region and one
availability zone (us-east-1a), no modules, two EC2 instances behind a network load balancer, shared security
groups, S3, DynamoDB, SQS, Lambda, KMS, and a global IAM role. Mock credentials as well.
Reuse the provider that multi-region already downloaded, then regenerate:

```sh
cd samples/terraform/single-az
terraform init -backend=false -plugin-dir=../multi-region/.terraform/providers   # or plain `terraform init`
terraform plan -out=tfplan
terraform show -json tfplan | node -e "process.stdout.write(JSON.stringify(JSON.parse(require('fs').readFileSync(0))))" > ../../../src/samples/single-az.plan.json
rm tfplan
```
