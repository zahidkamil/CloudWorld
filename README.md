# CloudWorld

Explore and defend your AWS infrastructure as an interactive 3D game world, generated from Terraform plan JSON.

- **CloudWorld Explorer** — walk your infrastructure and trace how resources connect.
- **CloudWorld Defender** — find attack paths, investigate risks, and choose remediations.

Everything runs in the browser. No AWS credentials, backend, or installs are needed.

Live site (after deployment): https://zahidkamil.github.io/CloudWorld/

## Local development

```bash
npm ci
npm run dev        # http://localhost:5173/CloudWorld/
npm run validate   # typecheck + lint + unit tests
npm run test:e2e   # Playwright against the production build
npm run review:visual   # lighting, selection, and console check of every world (needs a preview server)
npm run validate:glb    # size, triangle, and material checks for exported models
```

## Using your own plan

`terraform apply` is never needed. CloudWorld reads a plan, not deployed state.

```bash
cd your-terraform-directory
terraform init                          # once, downloads providers
terraform plan -out=plan.tfplan         # needs the AWS credentials your plan normally uses
terraform show -json plan.tfplan > plan.json
```

Upload or paste `plan.json` in CloudWorld. The file never leaves your browser.

- No AWS account handy? Try the bundled sample in `samples/terraform/multi-region` (mock credentials).
- Already applied? `terraform show -json > plan.json` (no plan file) exports state instead. It works, but it has no
  configuration section, so some relationships will be missing. A plan file gives the best result.
- `plan.json` can contain secrets. CloudWorld drops values Terraform marks sensitive and secret-looking fields in your
  browser, but do not commit or share the file.
- Terraform workspaces and root modules with several providers are fine. Non-AWS resources are skipped.

## Worlds

Each world is a library in `worlds/<id>/` (how every AWS resource looks, plus reference image names) and
`public/worlds/<id>/` (GLB models and `library.json`). To add one, use the `create-cloudworld-world` Skill in
`.kiro/skills/`, or run the `create-world` Kiro Workflow with a short description (the name is deduced), and see `worlds/README.md`.

## Project layout

See `.kiro/steering/structure.md`. Specs live in `.kiro/specs/`; progress in `docs/PROGRESS.md`.
