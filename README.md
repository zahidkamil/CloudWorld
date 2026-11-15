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
```

## Using your own plan

```bash
terraform plan -out=plan.tfplan
terraform show -json plan.tfplan > plan.json
```

Upload or paste `plan.json` in CloudWorld. The file never leaves your browser.

## Worlds

Each world is a library in `worlds/<id>/` (how every AWS resource looks, plus reference image names) and
`public/worlds/<id>/` (GLB models and `library.json`). To add one, use the `create-cloudworld-world` Skill in
`.kiro/skills/`, or run the `create-world` Kiro Workflow, and see `worlds/README.md`.

## Project layout

See `.kiro/steering/structure.md`. Specs live in `.kiro/specs/`; progress in `docs/PROGRESS.md`.
