# AWS resource looks: Modern City

Entry format: ``- `<key>` | model: `<file>.glb` | <status> | <how it looks>``. See `worlds/_template/resources.md`.
Style source: `docs/images/City-Theme.jpeg`.

## Structure

- `structure:region` | model: `region-island.glb` | planned | Floating city slab: grass top, layered earth and brick cutaway edge, soft long shadow underneath. A river channel can cut across it. Each region gets its own accent on awnings, banners and blossom colour.
- `structure:az` | model: `az-district.glb` | planned | A city block cluster bordered by streets or the river, sharing the region's look with a slightly different tint on sidewalks, tree foliage and window glass, plus a small plaza sign with the AZ name.
- `structure:vpc` | model: `vpc-boundary.glb` | planned | Low stone embankment wall with a hedge strip and evenly spaced street lamps marking the district perimeter. A gap in the wall holds the internet gateway.
- `structure:subnet` | model: `subnet-lot.glb` | planned | A paved city block. Public subnets face the street with crosswalks and blossom trees. Private subnets are inner courtyard blocks with green roofs and fewer vehicles.

## Families

- `family:compute` | model: `compute.glb` | planned | Mid-rise office block, 8 to 12 floors, beige stone with a regular window grid, a small rooftop unit and a rooftop garden patch.
- `family:containers` | model: `containers.glb` | planned | Low freight terminal: flat-roofed hall with colourful shipping containers stacked on the lot and a small gantry crane.
- `family:serverless` | model: `serverless.glb` | planned | Compact glass pavilion with a slim lightning-bolt sign on the roof, light blue glass and white frame.
- `family:database` | model: `database.glb` | planned | Round drum tower with stacked horizontal bands like data disks, grey-blue stone with thin green ring accents.
- `family:storage` | model: `storage.glb` | planned | Long low warehouse with roll-up doors and loading bays, sand-coloured walls, a small truck parked beside it.
- `family:gateway` | model: `gateway.glb` | planned | Stone arch bridge section with lamp posts, matching the arched bridge over the river in the reference. Traffic lanes pass through it.
- `family:loadbalancer` | model: `loadbalancer.glb` | planned | Traffic roundabout with a planted centre and signal posts. Roads fan out to the connected buildings.
- `family:edge` | model: `edge.glb` | planned | Hilltop radio mast on a small plaza with two satellite dishes and a slow blinking beacon.
- `family:messaging` | model: `messaging.glb` | planned | Post office with a clock gable, a mailbox row and a bus stop shelter in front.
- `family:security` | model: `security.glb` | planned | Bank-style building with stone columns, a heavy door and a small guard booth.
- `family:monitoring` | model: `monitoring.glb` | planned | Observation tower with a glass cab on top, a camera dome and a lit screen band near the crown.
- `family:generic` | model: `generic.glb` | planned | Neutral stone-beige block building with a flat roof and one AWS orange accent band, readable as "something else".

## Key services

- `aws_instance` | model: `ec2-instance.glb` | planned | Tall stepped office tower with balconies and a rooftop garden, like the central beige tower in the reference. Window grid reads as rows of servers.
- `aws_s3_bucket` | model: `s3-bucket.glb` | planned | Cluster of three grain-style silos with a small loading shed, pale grey metal with a green stripe.
- `aws_db_instance` | model: `rds-instance.glb` | planned | Taller round drum tower with a domed cap, grey-blue stone, green band rings, and a small secure entrance.
- `aws_lambda_function` | model: `lambda-function.glb` | planned | Glass cube kiosk with a bright lightning-bolt roof sign. Roof lamp pulses softly when invoked.
- `aws_lb` | model: `load-balancer.glb` | planned | Roundabout with a fountain in the middle and four signal posts, roads fanning out in several directions.
- `aws_nat_gateway` | model: `nat-gateway.glb` | planned | Toll gatehouse over a one-way street with a barrier arm, leading out of a private block.
- `aws_internet_gateway` | model: `internet-gateway.glb` | planned | Grand stone gateway arch at the district wall with flags, opening onto the main road.
- `aws_security_group` | model: `security-group.glb` | planned | Low stone and hedge fence ring with bollards and a gate. Members sit inside. All fences of one group share a coloured ribbon so shared groups are easy to spot.
- `aws_iam_role` | model: `iam-role.glb` | planned | Small town-hall kiosk with a flag and an ID-badge sign above the door.
- `aws_kms_key` | model: `kms-key.glb` | planned | Compact vault building with a round vault door and a golden key emblem above the entrance.
