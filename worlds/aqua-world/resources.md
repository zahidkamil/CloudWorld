# AWS resource looks: Aqua World

Entry format: ``- `<key>` | model: `<file>.glb` | <status> | <how it looks>``. See `worlds/_template/resources.md`.
Style source: `docs/images/Aqua-Theme.png`. No company logos on models; labels are shown in the UI.

## Structure

- `structure:region` | model: `region-island.glb` | planned | Reef island: rocky base with a mossy top, a waterfall on one side, coral and palms on the rim, and a sandy shoreline. Each region gets its own accent in coral colour and lantern glow.
- `structure:az` | model: `az-district.glb` | planned | A cluster of domes on a rock terrace joined to neighbours by wooden boardwalk bridges on stone piers. Shares the region look with small differences in coral colours, water tint and lantern density.
- `structure:vpc` | model: `vpc-boundary.glb` | planned | Ring of glowing cyan lantern posts and low glass barrier panels on stone posts around the district, with a boardwalk gate where the internet gateway sits.
- `structure:subnet` | model: `subnet-lot.glb` | planned | A paved boardwalk plaza. Public subnets are open decks with palms and lanterns. Private subnets are enclosed glass atriums with a garden inside.

## Families

- `family:compute` | model: `compute.glb` | planned | Curved white lab hall with a glass barrel roof and warm lit interiors showing desks and screens, cyan edge lights along the roofline.
- `family:containers` | model: `containers.glb` | planned | Row of small connected glass pods, each pod holding a glowing cube, linked by a short boardwalk.
- `family:serverless` | model: `serverless.glb` | planned | Small hovering glass bubble with a glowing bolt inside, floating just above a pad and bobbing gently.
- `family:database` | model: `database.glb` | planned | Smooth glass dome filled with softly glowing stacked discs and blue light, white base ring.
- `family:storage` | model: `storage.glb` | planned | Round white vault tower with a cylindrical glass middle section and a ring of porthole windows.
- `family:gateway` | model: `gateway.glb` | planned | Boardwalk bridge section with arched white gate frames and lantern posts at both ends.
- `family:loadbalancer` | model: `loadbalancer.glb` | planned | Circular hub plaza with a central glowing orb and boardwalks fanning out to the connected buildings.
- `family:edge` | model: `edge.glb` | planned | Slim white lighthouse tower with a rotating cyan beam and a ring of antennas.
- `family:messaging` | model: `messaging.glb` | planned | Dock with a transparent pneumatic tube loop and small glowing capsules shuttling along it.
- `family:security` | model: `security.glb` | planned | Heavy white pod with a round vault hatch and glowing cyan seals, partly sunk into the rock.
- `family:monitoring` | model: `monitoring.glb` | planned | Observation dome on stilts with a periscope and a ring of small screens glowing blue.
- `family:generic` | model: `generic.glb` | planned | Plain white and silver capsule building with a glass band and one orange accent stripe, readable as "something else".

## Key services

- `aws_instance` | model: `ec2-instance.glb` | planned | Wide curved glass lab hall with a barrel roof, warm amber windows showing rows of workstations, and cyan edge lighting, like the EC2 building in the reference.
- `aws_s3_bucket` | model: `s3-bucket.glb` | planned | Pale lab building with a tall cylindrical glass tower and a round dome roof, green accent stripe around the tower.
- `aws_db_instance` | model: `rds-instance.glb` | planned | Large geodesic glass dome with a white base ring and glowing blue data discs inside, like the RDS dome in the reference.
- `aws_lambda_function` | model: `lambda-function.glb` | planned | Floating glass bubble with a bright bolt, pulsing softly when invoked and leaving a few bubbles behind.
- `aws_lb` | model: `load-balancer.glb` | planned | Round plaza with a glowing cloud orb fountain in the centre and boardwalks leading out in several directions.
- `aws_nat_gateway` | model: `nat-gateway.glb` | planned | Small one-way lock chamber on a boardwalk, with a glass door and a glowing arrow sign pointing outward.
- `aws_internet_gateway` | model: `internet-gateway.glb` | planned | Grand white archway with tall curved spires and a glass half-dome, echoing the central grand dome, opening to the open sea.
- `aws_security_group` | model: `security-group.glb` | planned | Ring of glowing lantern posts joined by translucent energy-glass panels around the member buildings. All rings of one group share a glow colour.
- `aws_iam_role` | model: `iam-role.glb` | planned | White stone castle tower with crenellations, a gold-tipped spire, and small flags, like the castle on the rock island in the reference.
- `aws_kms_key` | model: `kms-key.glb` | planned | Small sealed glass vault dome with a rotating golden key hovering inside and a ring of cyan seals.
