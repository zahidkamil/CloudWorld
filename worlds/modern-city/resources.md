# AWS resource looks: Modern City

Entry format: ``- `<key>` | model: `<file>.glb` | <status> | <how it looks>``. See `worlds/_template/resources.md`.
Style source: `docs/images/City-Theme.jpeg`, pushed toward a Manhattan-style US downtown.
Built by `worlds/modern-city/blender/build_library.py` with the shared kit `worlds/_shared/blender/cw_kit.py`.

## Structure

- `structure:region` | model: `region-island.glb` | built | A granite obelisk monument on a stepped plinth with a gold cap and four little lamps, standing at the edge of each region's floating island like a city founding stone.
- `structure:az` | model: `az-district.glb` | built | A neighbourhood corner: a blue US mailbox beside a green lamp post carrying a district street sign. Each AZ block is ringed by its own avenue and sidewalk.
- `structure:vpc` | model: `vpc-boundary.glb` | built | The district gateway: two red-brick pylons with stone caps and glowing globe lamps, joined by a steel lintel with a cyan neon welcome sign.
- `structure:subnet` | model: `subnet-lot.glb` | built | A pocket park: a paved square around a round stone planter and leafy tree, two slatted benches and a warm street lamp.

## Families

- `family:compute` | model: `ec2-midrise.glb` | built | Nine-storey limestone office tower with a red-awning café at street level, corner pilasters, a setback penthouse, a wooden water tower and humming rooftop HVAC.
- `family:containers` | model: `containers-port.glb` | built | A container terminal: stacks of orange, blue, green, red and yellow shipping boxes on a concrete apron under a yellow gantry crane with a red beam and cyan warning lights.
- `family:serverless` | model: `lambda-food-truck.glb` | built | A white food truck with a teal cab, glowing serving hatch, red awning and a neon lightning bolt on the roof; little sidewalk tables with yellow umbrellas. It opens when invoked and is gone when idle.
- `family:database` | model: `rds-dome.glb` | built | A data observatory: a colonnaded limestone rotunda of fourteen white columns under a great copper-green ribbed dome, a glowing drum band and a cyan beacon on the lantern.
- `family:storage` | model: `s3-warehouse.glb` | built | A harbour-front brick warehouse with a slate gable roof, arched lit windows, steel loading doors on a dock, and orange, blue and green shipping containers waiting outside.
- `family:gateway` | model: `igw-bridge-tower.glb` | built | A gothic stone suspension-bridge tower: twin pointed-arch piers with slate spires, steel cables, a road deck with lamp posts and a cyan sign. Where the city meets the outside world.
- `family:loadbalancer` | model: `lb-plaza.glb` | built | A Times-Square-style junction: a round plaza around a steel tower wrapped in tiers of glowing billboards, four traffic-signal masts and painted arrows pointing every way.
- `family:edge` | model: `edge-broadcast-tower.glb` | built | A red-and-white lattice broadcast tower rising from a brick base, two white dishes aimed outward and a blinking aircraft light. Sends content to the world.
- `family:messaging` | model: `messaging-subway.glb` | built | A subway entrance: green railings, stairs sinking below the street, twin green globe lamps, and a green newsstand with magazines and a red awning. Messages ride the trains below.
- `family:security` | model: `kms-bank-vault.glb` | built | A granite reserve bank with banded rustication, four white columns, and a gleaming round steel vault door with a glowing rim and gold locking bolts.
- `family:monitoring` | model: `monitoring-clocktower.glb` | built | A brick clock tower with stone string courses, four glowing clock faces, a copper pyramid roof, a gold finial and a cyan beacon watching the whole district.
- `family:generic` | model: `generic-bodega.glb` | built | A corner bodega: brick walls, glowing wrap-around shop windows, a bright yellow awning on two sides, an OPEN neon sign and crates of red, green and orange produce.

## EC2 by instance size

The renderer reads `instance_type` and picks a tier: nano and micro are tiny, small and medium are small,
large and xlarge are large, 2xlarge and up (or metal) are huge.

- `aws_instance` | model: `ec2-midrise.glb` | built | Default EC2 when the size is unknown: the nine-storey limestone office tower with a café at street level and a wooden water tower on the roof.
- `aws_instance.tiny` | model: `ec2-walkup.glb` | built | t*.nano and micro: a four-storey red-brick walk-up with lit sash windows, a black iron fire escape zig-zagging down the front, a green-awning deli and a wooden water tower on stilts.
- `aws_instance.small` | model: `ec2-midrise.glb` | built | small and medium: the nine-storey limestone office tower, glowing window bands on every floor, a red-awning café and a setback penthouse.
- `aws_instance.large` | model: `ec2-skyscraper.glb` | built | large and xlarge: an art-deco setback skyscraper in three cream tiers with stone corner piers, a steel pyramid crown ringed by cyan neon chevrons and a needle spire.
- `aws_instance.huge` | model: `ec2-supertall.glb` | built | 2xlarge and up: a blue-glass octagonal supertall in three tapering segments, a ring of light on every floor, a glowing neon crown and a tall antenna mast. The tallest thing on the skyline.

## Key services

- `aws_s3_bucket` | model: `s3-warehouse.glb` | built | The harbour storage warehouse: brick, slate gable roof, arched lit windows, loading doors and stacked colourful containers. Objects go in, objects come out.
- `aws_db_instance` | model: `rds-dome.glb` | built | The copper-domed data observatory: a round colonnade of white columns, a glowing drum and a cyan lantern beacon. Big, round and impossible to miss.
- `aws_dynamodb_table` | model: `dynamodb-refinery.glb` | built | A data refinery: three tall white storage tanks with domed tops and cyan glowing rings, a steel pipe bridge, a brick pump house with a saw-tooth roof, and a red-and-white striped smokestack.
- `aws_lambda_function` | model: `lambda-food-truck.glb` | built | The pop-up food truck: white body, teal cab, glowing serving hatch, red awning, neon lightning bolt on the roof and sidewalk tables with yellow umbrellas.
- `aws_lb` | model: `lb-plaza.glb` | built | The Times-Square junction: billboard tower in three glowing tiers, four signal masts with red, amber and green lamps, and white arrows fanning traffic out.
- `aws_nat_gateway` | model: `nat-tollbooth.glb` | built | A toll plaza: three white booths with lit windows and red-and-white barrier arms under a yellow canopy with a neon sign. Private traffic leaves; nothing comes in uninvited.
- `aws_internet_gateway` | model: `igw-bridge-tower.glb` | built | The gothic suspension-bridge tower: twin stone piers with slate spires, cables and a lit road deck carrying traffic to the internet.
- `aws_security_group` | model: `sg-checkpoint.glb` | built | A checkpoint ring of fourteen yellow-and-black bollards linked by a steel chain, with a white guard booth, a lit window and a blue beacon on its roof.
- `aws_iam_role` | model: `iam-city-hall.glb` | built | City Hall: a white columned portico on grand steps, a triangular pediment, a white dome with a glowing drum and gold finial, and blue and red flags. It decides who may act.
- `aws_kms_key` | model: `kms-bank-vault.glb` | built | The granite reserve bank: columns, a round steel vault door with a glowing rim and gold bolts, and a neon sign over the entrance. The keys never leave.
- `aws_sqs_queue` | model: `messaging-subway.glb` | built | The subway entrance: stairs down, green railings and globe lamps, a newsstand. Messages wait on the platform until a train takes them.
- `aws_route53_zone` | model: `edge-broadcast-tower.glb` | built | The red-and-white lattice broadcast tower with two dishes and an aircraft light, announcing the city's names to the world.
- `aws_vpc` | model: `vpc-boundary.glb` | built | The district gateway arch: brick pylons, globe lamps and a cyan neon welcome sign over the avenue.
- `aws_subnet` | model: `subnet-lot.glb` | built | The pocket park: paved square, round planter tree, benches and a lamp. Each subnet is a little public square in its block.
- `aws_route_table` | model: `street-sign.glb` | built | A corner signal mast: black pole, crossed green street-name signs and a traffic light. It tells packets which way to turn.
- `aws_route_table_association` | model: `fire-hydrant.glb` | built | A red fire hydrant with a domed cap and side nozzles on a little paving square. Small, everywhere, holding things together.
- `aws_lb_target_group_attachment` | model: `fire-hydrant.glb` | built | The red fire hydrant: a small connector that clips a server to its target group, as common as hydrants on a street.
- `aws_db_subnet_group` | model: `fire-hydrant.glb` | built | The red fire hydrant: a small fixture that ties the database to the subnets it may use.
- `aws_eip` | model: `payphone.glb` | built | A blue city phone booth with a glowing glass door and a lit sign. Its number stays the same wherever you move it.
- `aws_lb_target_group` | model: `taxi-stand.glb` | built | A taxi stand: a yellow cab waiting at a sign post. The load balancer sends riders to whichever cab is free.

## Street props (decoration only, never resources)

- `prop:yellow-cab` | model: `prop-yellow-cab.glb` | built | A yellow taxi with a black stripe, dark windows and a glowing roof light, cruising the ring roads three per block.
- `prop:food-cart` | model: `prop-food-cart.glb` | built | A steel hot-dog cart with a lit menu panel and a red-and-yellow striped umbrella, parked on the sidewalk facing the block.
- `prop:cafe` | model: `prop-cafe.glb` | built | A brick corner café with a slate roof, glowing windows, a red awning, a neon sign and green-and-white umbrella tables out front. Fills an empty lot.
- `prop:shop-row` | model: `prop-shop-row.glb` | built | Three narrow storefronts in brick, limestone and blue with red, green and yellow awnings and glowing shop windows. Fills an empty lot.
