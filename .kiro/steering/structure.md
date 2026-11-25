# Project Structure

```
src/
  app/            App shell, session store
  engine/         Reusable foundation (no UI or app imports)
    terraform/    Plan JSON parsing and sanitizing (pure)
    graph/        InfrastructureGraph types, edges, shared dependency groups (pure)
    registry/     AWS resource registry entries (data-driven)
    topology/     Region / AZ / global / unresolved placement (pure)
    layout/       Deterministic world layout (pure)
    render/       Shared React Three Fiber scene, camera, highlighting
    security/     Defender rules, scan, scoring (pure)
  themes/         World list (worlds.ts), library loader, variation, storage, (later) llm/
  apps/
    explorer/     Explorer-specific overlays
    defender/     Defender scoring, remediation, missions
  ui/             DOM components (landing, world HUD, legend, inspector, import)
  samples/        Bundled Terraform plan JSON
  styles/         Global CSS tokens
  test/           Vitest setup
tests/e2e/        Playwright specs (tag cross-browser smoke tests with @smoke)
public/worlds/    Per-world library.json, models/*.glb, preview.webp (generated)
worlds/           Per-world instruction sets: world.md, resources.md, blender/*.py; _template/
scripts/          Dev and validation scripts
.kiro/            specs, steering, skills, hooks
docs/             PROGRESS.md, extension guides, docs/images/ reference images
```

## Dependency direction

`ui` and `apps` -> `engine` and `themes`. `engine` never imports from `ui`, `apps`, or `app`.
`themes/kits` may import `engine/render` primitives. Pure modules must not import React or three.

## Naming

- Components: `PascalCase.tsx`. Modules: `camelCase.ts` or `kebab-case.ts` matching neighbours.
- Tests sit next to code as `*.test.ts(x)`. E2E specs: `tests/e2e/*.spec.ts`.
- Registry entries keyed by Terraform type (`aws_instance`).
