# AWS resource looks: Haunted World

Entry format: ``- `<key>` | model: `<file>.glb` | <status> | <how it looks>``. See `worlds/_template/resources.md`.
Style source: `docs/images/Haunted-Theme.jpeg`.

## Structure

- `structure:region` | model: `region-island.glb` | planned | Raised cobblestone courtyard platform with a crenellated stone retaining wall, floating over dark mist. Each region gets its own accent glow: candle orange, ghost teal or spectral violet.
- `structure:az` | model: `az-district.glb` | planned | A walled terrace joined to its neighbours by round stone steps. Shares the region look, with small differences in fog density, candle count, pumpkin count and ghost-light tint.
- `structure:vpc` | model: `vpc-boundary.glb` | planned | Castle-style wall with crenellations and corner turrets, plus a spiked iron fence with drooping chains. The gate arch is the internet gateway.
- `structure:subnet` | model: `subnet-lot.glb` | planned | Cobblestone yard. Public subnets are open plazas with lanterns. Private subnets are walled graveyard gardens with tombstones and a bare tree.

## Families

- `family:compute` | model: `compute.glb` | planned | Gothic cottage with a blue slate roof, two dormers, a chimney, and pointed arch windows glowing orange.
- `family:containers` | model: `containers.glb` | planned | Row of small stone mausoleums, each with an arched door and a candle, sharing one low wall.
- `family:serverless` | model: `serverless.glb` | planned | Floating spectral lantern with a teal flame that hovers a little above a small stone plinth.
- `family:database` | model: `database.glb` | planned | Round stone keep with a conical blue slate roof, narrow glowing arch windows and a studded door.
- `family:storage` | model: `storage.glb` | planned | Stone cellar with a wooden hatch door, barrels and stacked pumpkins beside it.
- `family:gateway` | model: `gateway.glb` | planned | Stone archway with an iron portcullis, a lantern on each side and a small blue banner.
- `family:loadbalancer` | model: `loadbalancer.glb` | planned | Crossroads signpost shrine: round stone base, a gallows-style post with a hanging lantern and several arrow signs.
- `family:edge` | model: `edge.glb` | planned | Chapel bell tower with a tall spire, glowing belfry arches and a beam of light on top.
- `family:messaging` | model: `messaging.glb` | planned | Bare twisted tree with a roost platform, ravens and bats carrying small glowing letters.
- `family:security` | model: `security.glb` | planned | Iron-bound crypt vault with a door marked by glowing blue runes and a heavy padlock.
- `family:monitoring` | model: `monitoring.glb` | planned | Winged angel statue on a stone pedestal holding a glowing blue orb, like the statue in the reference.
- `family:generic` | model: `generic.glb` | planned | Rounded tombstone monument with an AWS orange rune carved into the face and a candle at its base.

## Key services

- `aws_instance` | model: `ec2-instance.glb` | planned | Tall gothic manor with a steep blue slate roof, a spire, several dormers, a porch and rows of glowing arch windows.
- `aws_s3_bucket` | model: `s3-bucket.glb` | planned | Pumpkin cellar: stone cellar entrance with a jack-o'-lantern on top and stacked pumpkins and barrels around it.
- `aws_db_instance` | model: `rds-instance.glb` | planned | Round turret keep taller than the family version, slate cone roof, a glowing stained-glass window and chained door.
- `aws_lambda_function` | model: `lambda-function.glb` | planned | Hovering teal wisp lantern with a lightning-shaped flame. Flares briefly when invoked.
- `aws_lb` | model: `load-balancer.glb` | planned | Crossroads gallows post with three hanging lanterns and arrow signs pointing to connected resources.
- `aws_nat_gateway` | model: `nat-gateway.glb` | planned | Heavy iron gate with a chain and padlock set into a short stone wall, opening outward only.
- `aws_internet_gateway` | model: `internet-gateway.glb` | planned | Grand gothic archway in the boundary wall with a tall blue heraldic banner and torches.
- `aws_security_group` | model: `security-group.glb` | planned | Spiked iron fence ring with sagging chains and faint glowing runes. Members stand inside. All fences of one group share a rune colour.
- `aws_iam_role` | model: `iam-role.glb` | planned | Stone pedestal with a blue heraldic banner standard and a small shield emblem.
- `aws_kms_key` | model: `kms-key.glb` | planned | Locked crypt vault with a candle-lit rune door and a large iron key hanging on the gate.
