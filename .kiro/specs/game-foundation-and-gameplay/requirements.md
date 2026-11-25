# Requirements — Game Foundation and Gameplay

Shared engine for CloudWorld Explorer and CloudWorld Defender: Terraform ingestion, infrastructure
graph, AWS resource registry, topology, layout, renderer, Explorer, and Defender.

## R1 Terraform ingestion

**User story:** As a player, I want to load a bundled sample, upload a plan file, or paste plan JSON so
that I can see my own AWS infrastructure without credentials or a backend.

- R1.1 WHEN the app starts THEN a bundled multi-region sample SHALL be available without network calls.
- R1.2 WHEN the user uploads or pastes JSON produced by `terraform show -json` THEN the system SHALL parse it in the browser.
- R1.3 WHEN `format_version` has an unsupported major version THEN the system SHALL reject it with a clear message.
- R1.4 WHEN the plan is valid THEN the system SHALL show a preview (regions, AZs, resource counts, warnings) before replacing the current graph.
- R1.5 IF validation fails or the user cancels THEN the current graph and theme SHALL remain unchanged.
- R1.6 The parser SHALL traverse root and child modules recursively and keep `count`/`for_each` indexes.
- R1.7 Values marked sensitive SHALL never be shown, logged, or persisted. Raw plans SHALL stay in memory only.
- R1.8 Files above 15 MB SHALL be rejected; graphs above 600 resources SHALL show a performance warning.

## R2 Infrastructure graph and AWS registry

- R2.1 The graph SHALL contain resources, edges (containment, reference, network, attachment), warnings, and topology, with no rendering fields.
- R2.2 Every `aws_*` resource SHALL appear in the graph; unregistered types SHALL use the generic landmark.
- R2.3 The registry SHALL define, per entry: types, category, placement scope, renderer tier, safe display attributes, relationship fields, and legend label.
- R2.4 The registry SHALL cover the core set (VPC, subnet, route table, IGW, NAT, security group, EC2, load balancer, RDS, S3, Lambda, IAM) and the expanded set (ECS, EKS, Auto Scaling, API Gateway, CloudFront, DynamoDB, ElastiCache, EFS, EBS, SQS, SNS, Kinesis, EventBridge, Route 53, CloudWatch, KMS, Secrets Manager, WAF, VPC endpoints, Transit Gateway).

## R3 Topology

- R3.1 Resources SHALL be placed by: explicit `region`/`availability_zone`, parent relationships (e.g., subnet), provider alias region, safe variables, ARN, else the "Unresolved" campus.
- R3.2 Global services (IAM, Route 53, CloudFront, WAF global scope) SHALL appear once in a global hub.
- R3.3 Regional resources SHALL appear once per region; multi-AZ resources SHALL appear at region level with links to their AZs.

## R4 Selection and dependency highlighting

- R4.1 WHEN a resource is selected THEN it SHALL be outlined and focused, and its direct dependencies highlighted.
- R4.2 WHEN a resource is selected THEN resources sharing a security group, subnet, IAM role, target group, KMS key, or Terraform variable reference SHALL be highlighted as peers.
- R4.3 Unrelated resources SHALL dim but remain visible.
- R4.5 WHEN a resource is selected THEN the world SHALL draw dotted, animated arcs from it to its direct dependencies and to the resources that use it, with arrow-free direction shown by dash flow. Arcs SHALL be hidden for unrelated resources, recolored per world, and capped (e.g. 40) with a "+N more" label.
- R4.4 Terraform variables SHALL NOT change relationships or security findings.

## R5 Explorer

- R5.1 The player SHALL orbit, pan, zoom, hover, select, and click-to-focus.
- R5.2 The inspector SHALL show type, name, address, location, safe attributes, and relationships.
- R5.3 The player SHALL trace a relationship chain by selecting related resources from the inspector.

## R6 Defender

- R6.1 Rules SHALL run on any supported graph: open security-group ingress, public compute, public database, public S3, wildcard IAM.
- R6.2 Findings SHALL include evidence, severity, an attack path, and remediation choices.
- R6.3 Choosing a remediation SHALL change only Defender session state; the graph SHALL NOT change.
- R6.4 Scoring SHALL be deterministic. A guided mission SHALL be built on the same rules.

## Out of scope

Azure, GCP, on-premises, runtime LLMs, multiplayer, advanced attack simulation, Terraform patch generation.
