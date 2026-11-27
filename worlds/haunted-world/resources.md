# AWS resource looks: Haunted World

Entry format: ``- `<key>` | model: `<file>.glb` | <status> | <how it looks>``. See `worlds/_template/resources.md`.
Style source: `docs/images/Haunted-Theme.jpeg`, pushed toward a lonely vampire estate where every house stands on its own.
Built by `worlds/haunted-world/blender/build_library.py` with the shared kit `worlds/_shared/blender/cw_kit.py`.
No model, file or layout is shared with another world.

## Structure

- `structure:region` | model: `region-gargoyle.glb` | built | A blue-grey stone pillar crowned by a crouching winged gargoyle with glowing orange eyes, guarding the edge of each region's floating estate.
- `structure:az` | model: `az-lamp-shrine.glb` | built | A tiny roadside shrine with a slate roof and a candle glowing inside, beside an iron post holding the district's hanging lantern.
- `structure:vpc` | model: `vpc-wall-gate.glb` | built | The estate wall: crenellated blue stone blocks, two little watch turrets with witch-hat roofs, and a pointed archway lit by a hanging lantern.
- `structure:subnet` | model: `subnet-graveyard.glb` | built | A frost-dusted graveyard yard: a cobble path between leaning rounded tombstones, a bare crooked tree and an iron lantern post.

## Families

- `family:compute` | model: `ec2-victorian-house.glb` | built | A tall purple-grey Victorian house with a witch-hat corner turret, a wrap-around porch on bone-white posts, a cross gable, glowing pointed windows and a jack-o'-lantern on the step.
- `family:containers` | model: `containers-mausoleum-row.glb` | built | A row of three little stone mausoleums sharing one back wall, each with slate roof, corner piers, an arched door, a glowing grille and a candle.
- `family:serverless` | model: `lambda-wisp-lantern.glb` | built | An iron lantern floating above a stone plinth with a teal lightning-shaped flame inside and ghost wisps circling it. It flares when invoked and sleeps when idle.
- `family:database` | model: `rds-moon-crypt.glb` | built | The moon crypt: a great round stone tower ringed with glowing teal oculi and pale buttresses, crenellated at the top, under a tall witch-hat slate roof with a teal beacon.
- `family:storage` | model: `s3-pumpkin-cellar.glb` | built | A pumpkin cellar dug into a mossy mound: a stone entrance with a slate gable and glowing door, a giant jack-o'-lantern on top, pumpkins and barrels stacked outside.
- `family:gateway` | model: `igw-castle-gate.glb` | built | The great gatehouse: twin round towers with slate cones and arrow slits, a crenellated wall, a raised iron portcullis, blue heraldic banners and two burning torches.
- `family:loadbalancer` | model: `lb-crossroads-gallows.glb` | built | A crossroads gallows: a dark timber post on a round stone base with three arms, each hanging an orange lantern, bone-white arrow signs pointing every way, and jack-o'-lanterns around it.
- `family:edge` | model: `edge-bell-tower.glb` | built | A chapel bell tower: blue stone, a glowing open belfry around a golden bell, a steep slate spire with four pinnacles and a teal light on the tip calling across the land.
- `family:messaging` | model: `messaging-raven-tree.glb` | built | A twisted dead tree where black ravens perch on every branch holding glowing letters, with a little lit post box at its roots.
- `family:security` | model: `kms-crypt-vault.glb` | built | A sealed crypt: stone walls with pale corner piers, a dark slate roof, an iron door carved with a glowing orange rune circle and a giant iron key hanging on a post.
- `family:monitoring` | model: `monitoring-angel-statue.glb` | built | A pale winged angel statue on a tall plinth holding up a glowing teal orb that watches the estate, with a teal inscription and candles at its feet.
- `family:generic` | model: `generic-tombstone.glb` | built | A great rounded tombstone on a stone step with a glowing orange rune circle and line, melting candles at its foot and a pumpkin beside it.

## EC2 by instance size

The renderer reads `instance_type` and picks a tier: nano and micro are tiny, small and medium are small,
large and xlarge are large, 2xlarge and up (or metal) are huge.

- `aws_instance` | model: `ec2-victorian-house.glb` | built | Default EC2 when the size is unknown: the tall Victorian house with its witch-hat turret, porch and glowing pointed windows.
- `aws_instance.tiny` | model: `ec2-crooked-cottage.glb` | built | nano and micro: a crooked little stone cottage with a steep blue slate roof, one glowing arched window, a leaning chimney with embers, pumpkins at the door and a spiked iron fence.
- `aws_instance.small` | model: `ec2-victorian-house.glb` | built | small and medium: the Victorian house, two storeys of purple-grey siding, a witch-hat turret with lit windows, a porch and a jack-o'-lantern on the step.
- `aws_instance.large` | model: `ec2-gated-manor.glb` | built | large and xlarge: a three-storey gated manor with two slate-roofed wings, a central tower with a tall spire, rows of glowing windows and a great arched iron gate between lantern-topped pillars.
- `aws_instance.huge` | model: `ec2-dracula-castle.glb` | built | 2xlarge and up: Dracula's castle on a rocky outcrop. Crenellated curtain walls, four witch-hat corner turrets, a gatehouse glowing orange, blood-red banners, a towering keep and a teal-lit spire with a red pennant. Its vampire lives alone.

## Key services

- `aws_s3_bucket` | model: `s3-pumpkin-cellar.glb` | built | The pumpkin cellar in its mossy mound: glowing door, a giant jack-o'-lantern on the roof, pumpkins and barrels piled outside. Objects go in, objects come out.
- `aws_db_instance` | model: `rds-moon-crypt.glb` | built | The round moon crypt tower: teal glowing oculi, crenellated rim, witch-hat slate roof and a candle-lit door. Big, round and impossible to miss.
- `aws_dynamodb_table` | model: `dynamodb-cauldron-brewery.glb` | built | A witch's brewery: three giant iron cauldrons bubbling teal over orange fires, a timber gantry with a hanging lantern, barrels and a tall stone chimney glowing at the top.
- `aws_lambda_function` | model: `lambda-wisp-lantern.glb` | built | The floating spectral lantern: teal lightning flame, circling wisps and candles on the plinth. It flares when invoked.
- `aws_lb` | model: `lb-crossroads-gallows.glb` | built | The crossroads gallows: three hanging lanterns and bone-white arrow signs sending travellers to whichever house answers.
- `aws_nat_gateway` | model: `nat-iron-gate.glb` | built | A heavy iron gate in a crenellated wall, swung outward between two slate-capped pillars, padlocked, under a teal one-way arrow. Leave, but never return uninvited.
- `aws_internet_gateway` | model: `igw-castle-gate.glb` | built | The great gatehouse: twin round towers, raised portcullis, blue banners and torches. The only road from the estate to the outside world.
- `aws_security_group` | model: `sg-spiked-fence.glb` | built | A ring of spiked iron posts with sagging chains and teal runes glowing on every other post, and a stone gate pillar with an orange lamp. Members stand inside.
- `aws_iam_role` | model: `iam-banner-standard.glb` | built | A heraldic standard: a stone pillar on round steps flying a long blue banner with a gold bar and a glowing teal crest, ringed by candles. It says who may enter.
- `aws_kms_key` | model: `kms-crypt-vault.glb` | built | The sealed crypt: an iron door with a glowing orange rune circle, and a giant iron key hanging outside that no one may take.
- `aws_sqs_queue` | model: `messaging-raven-tree.glb` | built | The raven tree: ravens wait on the branches with glowing letters until someone collects them.
- `aws_route53_zone` | model: `edge-bell-tower.glb` | built | The chapel bell tower: a glowing belfry and slate spire whose bell calls the estate's names across the land.
- `aws_vpc` | model: `vpc-wall-gate.glb` | built | The estate wall: crenellated stone, two watch turrets and a lantern-lit archway.
- `aws_subnet` | model: `subnet-graveyard.glb` | built | The frosty graveyard yard: leaning tombstones, a crooked tree and a lantern post along a cobble path.
- `aws_route_table` | model: `signpost-crooked.glb` | built | A crooked wooden signpost with three bone-white arrow boards, a glowing lamp on top and a jack-o'-lantern at its foot.
- `aws_route_table_association` | model: `candle-cluster.glb` | built | A cluster of melting cream candles on a dark stone, flames glowing orange. Small, everywhere, holding the estate together.
- `aws_lb_target_group_attachment` | model: `candle-cluster.glb` | built | The candle cluster: a small light that ties one house to the crossroads that sends it visitors.
- `aws_db_subnet_group` | model: `candle-cluster.glb` | built | The candle cluster: a small light that marks which yards the crypt may use.
- `aws_eip` | model: `lantern-post.glb` | built | An iron gallows post on a stone base with one hanging orange lantern. The light stays put wherever you move.
- `aws_lb_target_group` | model: `coffin-row.glb` | built | Three dark wooden coffins standing in a row with gold crosses, the middle lid ajar with light inside. The crossroads wakes whoever is ready.

## Street props (decoration only, never resources)

- `prop:hearse` | model: `prop-hearse.glb` | built | A black horse-less hearse with glowing windows, red velvet curtains, iron spikes on the roof and two coach lamps, rolling along the cobbled lanes.
- `prop:pumpkin-patch` | model: `prop-pumpkin-patch.glb` | built | A heap of pumpkins, two of them carved jack-o'-lanterns grinning orange, with a candle beside them on the frosty sidewalk.
- `prop:ghost` | model: `prop-ghost.glb` | built | A small teal ghost with dark eyes and a trailing wispy tail, floating along the sidewalk.
- `prop:graveyard` | model: `prop-graveyard.glb` | built | A little family graveyard behind a spiked iron fence: seven leaning tombstones, candles and two teal ghost wisps rising. Fills an empty lot.
- `prop:dead-tree` | model: `prop-dead-tree.glb` | built | A bare twisted tree with orange fairy lights on its branches and a teal ghost drifting at its roots. Fills an empty lot.
