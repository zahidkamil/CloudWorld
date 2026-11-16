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
