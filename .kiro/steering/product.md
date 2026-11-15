# Product — CloudWorld

CloudWorld turns AWS Terraform plan JSON into interactive 3D game worlds. Built for the Kiroween
Skeleton Crew hackathon (deadline December 4, 2026, 5 PM Eastern).

Two applications share one foundation (parser, graph, registry, topology, layout, themes, renderer):

- **CloudWorld Explorer:** explore infrastructure, select resources, trace relationships.
- **CloudWorld Defender:** find attack paths, investigate findings, choose remediations, earn points.

## Priorities (in order)

1. Beautiful, playable, polished 3D worlds.
2. Simplicity and working functionality over feature count.
3. A reusable, documented foundation others can build on.

## Scope rules

- AWS only. Azure, GCP, on-prem, runtime LLMs, multiplayer, and advanced attack simulation are out of scope.
- Everything runs in the browser on GitHub Pages under `/CloudWorld/`. No backend, credentials, or API keys.
- Plans stay in memory. Never log, persist, or display sensitive values.
- Themes never change the graph, selection semantics, or security findings.
- Defender remediation is simulated; never generate or modify Terraform.

## Progress

`docs/PROGRESS.md` and each Spec's `tasks.md` are the source of truth for status.
After each completed task: validate, report, wait for owner approval, then commit and push.
