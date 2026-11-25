---
name: find-terraform-security-issues
description: Find security issues such as open ports, public buckets, and wildcard IAM in a Terraform plan JSON, and turn them into CloudWorld Defender findings or new rules. Use when asked to check a plan for vulnerabilities, add or test a Defender security rule, or choose a scanning tool.
---

# Find security issues in Terraform plan JSON

CloudWorld Defender turns findings into a game: each finding has evidence, three hints, and simulated fixes.
Findings come from pure rules in `src/engine/security/`. This skill covers how to find issues in a plan,
which tools can help, and how to turn an issue into a rule.

## What is already built

- `src/engine/security/rules.ts`: rule `open-sensitive-port` flags security groups that allow `0.0.0.0/0` or `::/0` on SSH (22),
  Telnet, RDP, SQL Server, MySQL, PostgreSQL, Redis, Elasticsearch, MongoDB, or every port. Web ports 80 and 443 are not flagged.
- `src/engine/security/scan.ts`: `scanGraph(graph)` runs all rules. Sorted by severity, then id. Pure and deterministic.
- `src/engine/security/scoring.ts`: 100 points per catch, 25 off per hint (minimum 25), 10 off for a wrong fix, never below zero.
- Graph facts the rules read live on `CloudResource.exposure` (built in `src/engine/graph/build.ts`). Rules never read raw plan JSON.
- Attack paths, more rules, and 3D markers are planned for Task 9 (see `.kiro/specs/game-foundation-and-gameplay/tasks.md`).

## Tools to find issues (checked on this machine, November 2026)

| Option                                                                     | Status                  | Notes                                                                                                                                |
| -------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| CloudWorld rules (`scanGraph`)                                             | Built in                | Always use first. No install.                                                                                                        |
| Configured MCP servers (Blender, Playwright, Terraform, AWS documentation) | None scan for security  | The Terraform MCP reads provider schemas, not plans. Use the AWS documentation MCP to confirm a best practice before writing a rule. |
| Trivy (`trivy config`)                                                     | Not installed           | Reads a Terraform plan JSON. Covers many AWS checks.                                                                                 |
| Checkov (`checkov -f plan.json --framework terraform_plan`)                | Not installed           | Large rule set, reads plan JSON. Needs Python.                                                                                       |
| tfsec                                                                      | Not installed           | Now folded into Trivy. Prefer Trivy.                                                                                                 |
| `jq` / Node one-liners                                                     | Always available (Node) | Good for a quick look at one kind of issue.                                                                                          |

Installing a scanner changes the machine, so ask the user first. Scanners are development aids. The app never calls them and
the deployed site stays static.

## Workflow

1. **Get the plan JSON.** `terraform plan -out=tfplan && terraform show -json tfplan > plan.json`. For the bundled samples use
   `src/samples/*.plan.json`. Treat the file as sensitive. Never print values marked sensitive, user data, or secrets.
2. **Scan with CloudWorld first.** Write a small vitest or node check that imports the plan with `importPlan` and calls `scanGraph`.
3. **Optionally cross-check with a scanner** (after the user approves the install):
   - `trivy config --format json plan.json > trivy.json`
   - `checkov -f plan.json --framework terraform_plan -o json > checkov.json`
     Compare scanner findings with CloudWorld findings and note gaps. Do not paste raw scanner output into the repo.
4. **Quick manual queries** over `resource_changes[].change.after` when you need a one-off answer:
   ```sh
   # Security groups open to the world (ports only, no other values printed)
   jq -r '.resource_changes[] | select(.type=="aws_security_group") | .change.after as $a
     | $a.ingress[]? | select((.cidr_blocks // []) + (.ipv6_cidr_blocks // []) | any(. == "0.0.0.0/0" or . == "::/0"))
     | "\(.from_port)-\(.to_port) \(.protocol)"' plan.json
   ```
5. **Turn an issue into a rule** (only when the user asks, or in Task 9):
   1. Check the AWS documentation or provider schema so the attribute names and defaults are right (Terraform MCP `get_provider_details`,
      AWS documentation MCP `search_documentation`).
   2. If the rule needs a new fact, add a safe field to `CloudResource` and compute it in `build.ts`. Booleans, ports, and CIDR strings only.
      Never copy ARNs with account ids, passwords, tokens, user data, or policy documents verbatim.
   3. Add the rule to `src/engine/security/rules.ts` and to `RULES`. Give each finding a stable `id`, plain-words `evidence`, three hints from
      gentle to almost-the-answer, and at least one correct and one wrong simulated fix.
   4. Write tests in `src/engine/security/security.test.ts`: positive, negative, partial data, deterministic order, graph not changed.
   5. Run `npm run validate`.

## Candidate rules for Task 9

- Public S3 bucket (public access block disabled, public ACL or policy).
- Wildcard IAM (`Action: "*"` or `Resource: "*"` on a role policy).
- Publicly accessible RDS (`publicly_accessible = true`) or unencrypted storage.
- Unencrypted EBS, S3, DynamoDB, or SQS where a KMS key is expected.
- Lambda or EC2 in a public subnet with a world-open security group (a real attack path: internet -> group -> resource -> data).

## Rules

- Findings and docs never include secrets, account ids, or raw plan values.
- Remediation in the game is simulated. Never generate or edit Terraform.
- Do not broaden permissions or install tools without asking.
