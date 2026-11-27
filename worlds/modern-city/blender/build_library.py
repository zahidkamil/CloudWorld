"""Modern City: a US downtown (think Manhattan) built from your AWS plan.

Run through the Blender MCP:
    exec(open("<repo>/worlds/modern-city/blender/build_library.py").read())

Builds every model listed in worlds/modern-city/resources.md with the shared kit, exports Draco GLBs to
public/worlds/modern-city/models/, then writes public/worlds/modern-city/library.json with measured heights.
Original geometry only. Blender Z is up.
"""
import json
import math
import os

REPO = "/Users/zahidkamil/Documents/Learning/KiroweenHackathon/CloudWorld/CloudWorld"
exec(open(os.path.join(REPO, "worlds/_shared/blender/cw_kit.py")).read())

WORLD = "modern-city"
OUT = os.path.join(REPO, "public/worlds", WORLD, "models")

C = {
    "brick": "#b5523b", "brick_dark": "#8e3b2b", "brown": "#7a4a36", "lime": "#e4d6b8", "stone": "#c9b48e",
    "stone_dark": "#a08b6a", "glass": "#5f8fb8", "glass_dark": "#3f6688", "teal_glass": "#4fa3a5", "slate": "#4f5d73",
    "steel": "#8d99a6", "steel_dark": "#5a6470", "copper": "#5fae96", "white": "#f1efe8", "red": "#d94a3d",
    "green": "#2f8f5b", "yellow": "#f2c94c", "blue": "#3b6fd1", "orange": "#ec8a2e", "wood": "#8a5a3a",
    "black": "#26282e", "asphalt": "#3a3d4a", "cab": "#f5c518", "paving": "#d9d2c3", "leaf": "#6fae3f",
    "pink": "#f3a6c8", "gold": "#e0b04a", "concrete": "#b8b4aa",
}


def gable(k, color, w, d, z0, pitch=32, overhang=0.15, ridge="x"):
    """Two sloped panels meeting at a ridge. Ridge runs along X (default) or Y."""
    a = math.radians(pitch)
    half = d / 2 + overhang
    length = half / math.cos(a)
    rise = half * math.tan(a)
    for s in (-1, 1):
        if ridge == "x":
            k.box(color, (w + overhang * 2, length, 0.14), (0, s * half / 2, z0 + rise / 2 - 0.07), rot=(-s * a, 0, 0))
        else:
            k.box(color, (length, w + overhang * 2, 0.14), (s * half / 2, 0, z0 + rise / 2 - 0.07), rot=(0, s * a, 0))
    return rise


def water_tower(k, x, y, z, s=1.0):
    for lx, ly in ((-0.3, -0.3), (0.3, -0.3), (-0.3, 0.3), (0.3, 0.3)):
        k.box(C["black"], (0.07 * s, 0.07 * s, 0.7 * s), (x + lx * s, y + ly * s, z))
    k.cyl(C["wood"], 0.48 * s, 0.85 * s, (x, y, z + 0.7 * s), verts=12)
    k.cyl(C["slate"], 0.55 * s, 0.4 * s, (x, y, z + 1.55 * s), verts=12, top=0.05)


def hvac(k, x, y, z):
    k.box(C["steel"], (0.7, 0.5, 0.35), (x, y, z))
    k.cyl(C["steel_dark"], 0.16, 0.08, (x, y, z + 0.35), verts=10)


def storefront(k, width, y, color_awning, sign=True):
    """Glowing shop window, door and awning on the -Y (front) face."""
    k.box("#ffffff", (width * 0.7, 0.06, 0.75), (0, y - 0.03, 0.25), "glow")
    k.box(C["black"], (0.45, 0.07, 0.85), (width * 0.38, y - 0.04, 0.0))
    k.box(color_awning, (width * 0.9, 0.8, 0.1), (0, y - 0.4, 1.12), rot=(math.radians(-14), 0, 0))
    if sign:
        k.box("#ffffff", (width * 0.45, 0.05, 0.22), (0, y - 0.05, 1.32), "neon")


def wheels(k, xs, y_half, r=0.22, z=0.0):
    for x in xs:
        for y in (-y_half, y_half):
            k.cyl(C["black"], r, 0.16, (x, y + (0.08 if y < 0 else -0.08), z + r), verts=10, rot=(math.pi / 2, 0, 0))


# ---------------------------------------------------------------- EC2, sized by instance type
def ec2_walkup(k):
    """t*.nano / micro: four-storey red-brick walk-up, fire escape, corner deli, wooden water tower."""
    w, d, fh = 4.4, 4.0, 1.05
    k.box(C["brick"], (w, d, 4 * fh), (0, 0, 0))
    k.box(C["stone"], (w + 0.18, d + 0.18, 0.22), (0, 0, 4 * fh))
    k.box(C["brick_dark"], (w + 0.06, d + 0.06, 0.18), (0, 0, fh))
    k.window_grid(w, d, fh, 3, fh, 3, skip_every=5)
    storefront(k, w, -d / 2, C["green"])
    for f in range(1, 4):  # fire escape landings and ladders
        z = f * fh + 0.05
        k.box(C["black"], (1.5, 0.5, 0.05), (-0.9, -d / 2 - 0.3, z))
        k.box(C["black"], (1.5, 0.04, 0.32), (-0.9, -d / 2 - 0.55, z))
        k.box(C["black"], (0.05, 0.05, fh), (-0.25, -d / 2 - 0.45, z), rot=(0, math.radians(22), 0))
    water_tower(k, 1.0, 0.6, 4 * fh + 0.22, 1.1)
    k.box(C["steel"], (0.6, 0.6, 0.3), (-1.2, 0.8, 4 * fh + 0.22))


def ec2_midrise(k):
    """small / medium: nine-storey limestone office, ground-floor café, setback, rooftop tank."""
    k.box(C["stone_dark"], (5.2, 5.0, 1.6), (0, 0, 0))
    storefront(k, 5.2, -2.5, C["red"])
    k.box(C["lime"], (4.4, 4.4, 6.4), (0, 0, 1.6))
    k.window_bands(4.4, 4.4, 1.6, 7, 0.9)
    for x in (-2.2, 2.2):
        for y in (-2.2, 2.2):
            k.box(C["stone"], (0.3, 0.3, 6.4), (x, y, 1.6))
    k.box(C["stone"], (4.7, 4.7, 0.25), (0, 0, 8.0))
    k.box(C["lime"], (3.2, 3.2, 1.4), (0, 0, 8.25))
    k.window_bands(3.2, 3.2, 8.25, 1, 1.0)
    k.box(C["stone_dark"], (3.4, 3.4, 0.2), (0, 0, 9.65))
    water_tower(k, 0.7, 0.6, 9.85)
    hvac(k, -0.9, -0.8, 9.85)


def ec2_skyscraper(k):
    """large / xlarge: art-deco setback skyscraper with a stepped, neon-ribbed crown."""
    k.box(C["stone_dark"], (5.6, 5.6, 1.8), (0, 0, 0))
    storefront(k, 5.6, -2.8, C["blue"])
    tiers = [(4.6, 1.8, 6.4), (3.6, 8.2, 4.2), (2.6, 12.4, 3.0)]
    for size, z, h in tiers:
        k.box(C["lime"], (size, size, h), (0, 0, z))
        k.window_bands(size, size, z, int(h / 0.95), 0.95)
        for x in (-size / 2, size / 2):
            for y in (-size / 2, size / 2):
                k.box(C["stone"], (0.32, 0.32, h + 0.1), (x, y, z))
        k.box(C["stone"], (size + 0.3, size + 0.3, 0.2), (0, 0, z + h))
    k.cyl(C["steel"], 1.25, 2.2, (0, 0, 15.6), verts=4, top=0.3, rot=(0, 0, math.pi / 4))
    for i in range(3):  # neon chevrons on the crown
        r = 1.15 - i * 0.3
        k.cyl("#ffffff", r + 0.04, 0.12, (0, 0, 15.9 + i * 0.6), "neon", verts=4, rot=(0, 0, math.pi / 4))
    k.cyl(C["steel"], 0.06, 2.4, (0, 0, 17.8), verts=6)
    k.sphere("#ffffff", 0.12, (0, 0, 20.25), "glow")


def ec2_supertall(k):
    """2xlarge and up: a glass supertall with chamfered corners, lit crown and a mast."""
    k.box(C["glass_dark"], (5.6, 5.6, 2.0), (0, 0, 0))
    k.box("#ffffff", (5.66, 5.66, 1.0), (0, 0, 0.4), "glow")
    segs = [(2.55, 2.0, 8.0), (2.2, 10.0, 6.5), (1.85, 16.5, 5.0)]
    for r, z, h in segs:
        k.cyl(C["glass"], r, h, (0, 0, z), verts=8, rot=(0, 0, math.pi / 8))
        floors = int(h / 1.1)
        for f in range(floors):
            k.cyl("#ffffff", r + 0.03, 0.18, (0, 0, z + 0.45 + f * 1.1), "glow", verts=8, rot=(0, 0, math.pi / 8))
        k.cyl(C["steel"], r + 0.12, 0.25, (0, 0, z + h), verts=8, rot=(0, 0, math.pi / 8))
    k.cyl("#ffffff", 1.6, 1.2, (0, 0, 21.75), "neon", verts=8, top=1.1, rot=(0, 0, math.pi / 8))
    k.cyl(C["steel"], 1.1, 0.6, (0, 0, 22.95), verts=8, top=0.4, rot=(0, 0, math.pi / 8))
    k.cyl(C["steel"], 0.1, 4.0, (0, 0, 23.5), verts=6)
    k.sphere("#ffffff", 0.16, (0, 0, 27.6), "glow")


# ---------------------------------------------------------------- data
def rds_dome(k):
    """Data observatory: a colonnaded rotunda under a great copper-green dome."""
    k.cyl(C["stone_dark"], 2.8, 0.35, (0, 0, 0), verts=24)
    k.box(C["stone"], (1.8, 1.0, 0.35), (0, -2.9, 0))
    k.cyl(C["lime"], 2.55, 0.6, (0, 0, 0.35), verts=24)
    for i in range(14):
        a = i / 14 * math.tau
        k.cyl(C["white"], 0.14, 1.9, (math.cos(a) * 2.3, math.sin(a) * 2.3, 0.95), verts=8)
    k.cyl(C["lime"], 2.6, 0.4, (0, 0, 2.85), verts=24)
    k.cyl(C["lime"], 2.05, 1.0, (0, 0, 3.25), verts=24)
    k.cyl("#ffffff", 2.08, 0.32, (0, 0, 3.55), "glow", verts=24)
    k.dome(C["copper"], 2.05, (0, 0, 4.25), height_scale=0.85)
    for i in range(8):  # dome ribs
        a = i / 8 * math.tau
        k.box(C["white"], (0.08, 0.08, 1.7), (math.cos(a) * 1.45, math.sin(a) * 1.45, 4.25), rot=(0, 0, a))
    k.cyl(C["white"], 0.32, 0.6, (0, 0, 5.9), verts=10)
    k.sphere("#ffffff", 0.28, (0, 0, 6.65), "neon")
    k.cyl(C["gold"], 0.05, 0.6, (0, 0, 6.9), verts=6)


def dynamodb_refinery(k):
    """Data refinery: giant white storage tanks with glowing rings, pipes and a striped smokestack."""
    k.box(C["concrete"], (5.8, 4.8, 0.25), (0, 0, 0))
    for x in (-1.75, 0.0, 1.75):
        k.cyl(C["white"], 0.82, 3.6, (x, 0.65, 0.25), verts=16)
        k.dome(C["white"], 0.82, (x, 0.65, 3.85), segments=16, height_scale=0.5)
        for z in (1.0, 2.2, 3.3):
            k.cyl("#ffffff", 0.85, 0.12, (x, 0.65, z), "neon", verts=16)
        k.cyl(C["red"], 0.84, 0.18, (x, 0.65, 0.4), verts=16)
    k.cyl(C["steel"], 0.12, 3.5, (0, -0.35, 2.9), verts=8, rot=(0, math.pi / 2, 0))
    k.box(C["brick"], (3.4, 1.4, 1.6), (-0.9, -1.75, 0.25))
    k.window_grid(3.4, 1.4, 0.25, 1, 1.4, 4, sides="front")
    for i in range(3):  # saw-tooth roof
        k.box(C["slate"], (1.1, 1.5, 0.12), (-2.0 + i * 1.12, -1.75, 2.1), rot=(0, math.radians(-28), 0))
    k.cyl(C["brick_dark"], 0.38, 6.0, (2.2, -1.7, 0.25), verts=12, top=0.3)
    for z in (4.6, 5.6):
        k.cyl(C["white"], 0.37, 0.25, (2.2, -1.7, z), verts=12)
    k.sphere("#ffffff", 0.14, (2.2, -1.7, 6.35), "glow")


def s3_warehouse(k):
    """Harbour storage warehouse: brick, arched windows, loading bays and stacked shipping containers."""
    k.box(C["brick"], (5.2, 3.2, 2.6), (0, 0.6, 0))
    gable(k, C["slate"], 5.2, 3.2, 2.6, pitch=24)
    for x in (-1.8, -0.6, 0.6, 1.8):
        k.box("#ffffff", (0.6, 0.06, 0.9), (x, -1.02, 1.4), "glow")
        k.cyl(C["stone"], 0.32, 0.08, (x, -1.04, 2.28), verts=10, rot=(math.pi / 2, 0, 0))
    for x in (-1.2, 1.2):
        k.box(C["steel_dark"], (1.3, 0.08, 1.2), (x, -1.03, 0.0))
    k.box(C["concrete"], (5.4, 1.0, 0.3), (0, -1.5, 0))
    for x, z, color in ((-1.4, 0.3, C["orange"]), (-1.4, 1.16, C["blue"]), (1.3, 0.3, C["green"])):
        k.box(color, (2.2, 0.9, 0.85), (x, -2.4, z))
    for x in (-2.4, 2.4):
        k.box(C["stone"], (0.3, 3.3, 2.8), (x, 0.6, 0))


# ---------------------------------------------------------------- compute neighbours
def lambda_food_truck(k):
    """Lambda: a pop-up food truck. It opens when invoked and is gone when idle."""
    k.box(C["white"], (4.0, 2.0, 1.9), (-0.3, 0, 0.45))
    k.box(C["teal_glass"], (1.2, 1.9, 1.25), (2.2, 0, 0.45))
    k.box(C["glass_dark"], (0.06, 1.6, 0.6), (2.82, 0, 1.0))
    k.box("#ffffff", (2.3, 0.06, 0.8), (-0.5, -1.03, 1.15), "glow")
    k.box(C["red"], (2.6, 0.9, 0.1), (-0.5, -1.45, 2.05), rot=(math.radians(-18), 0, 0))
    k.box(C["yellow"], (2.6, 0.06, 0.25), (-0.5, -1.03, 1.95))
    wheels(k, (-1.5, 1.8), 1.0)
    bolt = [(0.0, 0.0, 0.0), (0.18, 0.0, 0.42), (-0.05, 0.0, 0.8)]
    for i, (dx, _, dz) in enumerate(bolt):
        k.box("#ffffff", (0.16, 0.12, 0.5), (-0.5 + dx, 0, 2.4 + dz), "neon", rot=(0, math.radians(30 if i % 2 else -30), 0))
    for x in (-2.2, 1.2):  # sidewalk tables
        k.cyl(C["steel"], 0.35, 0.06, (x, -2.4, 0.7), verts=10)
        k.cyl(C["steel"], 0.04, 0.7, (x, -2.4, 0), verts=6)
        k.cone(C["yellow"], 0.7, 0.35, (x, -2.4, 1.5), verts=8, rot=(0, 0, 0))
        k.cyl(C["steel"], 0.03, 0.8, (x, -2.4, 0.7), verts=6)


def containers_port(k):
    """ECS / EKS: a container terminal with colourful stacks under a gantry crane."""
    k.box(C["concrete"], (5.8, 5.2, 0.2), (0, 0, 0))
    colors = [C["orange"], C["blue"], C["green"], C["red"], C["yellow"], C["steel"]]
    i = 0
    for x in (-1.6, 0.0, 1.6):
        for y in (-1.1, 0.9):
            levels = 2 if (i % 3) else 3
            for lvl in range(levels):
                k.box(colors[(i + lvl) % len(colors)], (1.4, 1.6, 0.72), (x, y, 0.2 + lvl * 0.74))
            i += 1
    for x in (-2.7, 2.7):
        k.box(C["yellow"], (0.25, 0.25, 4.0), (x, -2.2, 0.2))
        k.box(C["yellow"], (0.25, 0.25, 4.0), (x, 2.2, 0.2))
        k.box(C["yellow"], (0.25, 4.6, 0.3), (x, 0, 4.2))
    k.box(C["red"], (5.7, 0.4, 0.35), (0, 0, 4.4))
    k.box(C["steel_dark"], (1.2, 0.8, 0.5), (0.6, 0, 3.8))
    for x in (-2.7, 2.7):
        k.sphere("#ffffff", 0.14, (x, 0, 4.7), "neon")


def lb_plaza(k):
    """Load balancer: a Times-Square-style junction. Signal posts send traffic every way, billboards glow."""
    k.cyl(C["paving"], 2.85, 0.15, (0, 0, 0), verts=28)
    k.cyl(C["asphalt"], 2.4, 0.05, (0, 0, 0.15), verts=28)
    k.cyl(C["leaf"], 0.9, 0.3, (0, 0, 0.15), verts=16)
    k.box(C["steel_dark"], (0.6, 0.6, 4.6), (0, 0, 0.45))
    for i, h in enumerate((2.0, 3.0, 4.0)):
        for side in range(4):
            a = side * math.pi / 2 + i * 0.4
            k.box("#ffffff" if side % 2 else C["white"], (1.3, 0.08, 0.75), (math.cos(a) * 0.42, math.sin(a) * 0.42, 0.45 + h - 0.3), "neon" if (side + i) % 2 else "glow", rot=(0, 0, a + math.pi / 2))
    k.cone(C["steel"], 0.5, 0.6, (0, 0, 5.05), verts=4)
    for a in (math.pi / 4, 3 * math.pi / 4, 5 * math.pi / 4, 7 * math.pi / 4):
        x, y = math.cos(a) * 2.2, math.sin(a) * 2.2
        k.cyl(C["black"], 0.06, 2.0, (x, y, 0.15), verts=6)
        k.box(C["black"], (0.3, 0.3, 0.8), (x, y, 2.15))
        for j, z in enumerate((2.75, 2.5, 2.25)):
            k.sphere("#ffffff", 0.08, (x - math.cos(a) * 0.16, y - math.sin(a) * 0.16, z), "glow" if j else "neon")
    for a in (0, math.pi / 2, math.pi, 1.5 * math.pi):  # painted arrows
        k.box(C["white"], (0.9, 0.18, 0.02), (math.cos(a) * 1.7, math.sin(a) * 1.7, 0.2), rot=(0, 0, a))


def igw_bridge_tower(k):
    """Internet gateway: a gothic stone suspension-bridge tower where the city meets the outside world."""
    k.box(C["asphalt"], (5.8, 2.0, 0.25), (0, 0, 0.9))
    k.box(C["stone_dark"], (5.8, 0.15, 0.35), (0, -1.05, 1.15))
    k.box(C["stone_dark"], (5.8, 0.15, 0.35), (0, 1.05, 1.15))
    for x in (-1.5, 1.5):
        k.box(C["stone"], (1.1, 2.8, 6.6), (x, 0, 0))
        k.box(C["stone_dark"], (1.25, 2.95, 0.35), (x, 0, 6.6))
        k.cone(C["slate"], 0.9, 0.9, (x, 0, 6.95), verts=4)
        for y in (-0.6, 0.6):
            k.box(C["black"], (0.06, 0.5, 2.0), (x - 0.57, y, 3.6))
            k.cone(C["black"], 0.3, 0.5, (x - 0.57, y, 5.6), verts=4, rot=(0, 0, 0))
    k.box(C["stone"], (4.1, 2.8, 1.0), (0, 0, 5.2))
    for y in (-1.3, 1.3):
        for s in (-1, 1):
            k.box(C["steel_dark"], (0.06, 0.06, 4.4), (s * 2.7, y, 2.6), rot=(0, s * math.radians(-38), 0))
    for x in (-2.6, 0.0, 2.6):
        k.cyl(C["black"], 0.04, 0.9, (x, -1.0, 1.15), verts=6)
        k.sphere("#ffffff", 0.12, (x, -1.0, 2.1), "glow")
    k.box("#ffffff", (2.6, 0.08, 0.35), (0, -1.45, 5.5), "neon")


def nat_tollbooth(k):
    """NAT gateway: a toll plaza. Private traffic leaves through the booths, nothing gets in uninvited."""
    k.box(C["asphalt"], (5.8, 4.4, 0.12), (0, 0, 0))
    for x in (-1.9, 0.0, 1.9):
        k.box(C["white"], (0.8, 1.0, 1.4), (x, 0, 0.12))
        k.box("#ffffff", (0.82, 0.6, 0.45), (x, 0, 0.8), "glow")
        k.box(C["red"], (0.12, 1.8, 0.1), (x + 0.55, -1.2, 0.95))
        k.box(C["white"], (0.12, 0.4, 0.11), (x + 0.55, -1.5, 0.95))
    for x in (-2.7, 2.7):
        k.box(C["steel"], (0.2, 0.2, 2.4), (x, 0, 0.12))
    k.box(C["steel_dark"], (5.8, 2.0, 0.25), (0, 0, 2.5))
    k.box(C["yellow"], (5.8, 2.0, 0.1), (0, 0, 2.75))
    k.box("#ffffff", (3.6, 0.08, 0.35), (0, -1.05, 2.3), "neon")


def sg_checkpoint(k):
    """Security group: a checkpoint ring of bollards and chains with a guard booth and blue beacon."""
    for i in range(14):
        a = i / 14 * math.tau
        x, y = math.cos(a) * 2.5, math.sin(a) * 2.5
        k.cyl(C["yellow"] if i % 2 else C["black"], 0.13, 0.85, (x, y, 0), verts=8)
        k.sphere(C["black"], 0.13, (x, y, 0.85), segments=8, rings=4)
    k.torus(C["steel_dark"], 2.5, 0.03, (0, 0, 0.7), segments=28)
    k.box(C["white"], (1.2, 1.0, 1.7), (0, -1.6, 0))
    k.box("#ffffff", (1.22, 0.7, 0.55), (0, -1.6, 0.95), "glow")
    k.box(C["slate"], (1.4, 1.2, 0.15), (0, -1.6, 1.7))
    k.sphere("#ffffff", 0.2, (0, -1.6, 2.05), "neon")


def iam_city_hall(k):
    """IAM role: City Hall. A columned portico, a white dome and flags. It decides who may act."""
    k.box(C["stone"], (5.6, 4.6, 0.3), (0, 0, 0))
    for i in range(3):
        k.box(C["stone_dark"], (3.6, 0.45, 0.15), (0, -2.3 - i * 0.22, 0.3 - i * 0.12))
    k.box(C["white"], (5.0, 3.4, 2.6), (0, 0.4, 0.3))
    k.window_grid(5.0, 3.4, 0.3, 2, 1.25, 5, sides="front")
    for x in (-1.5, -0.9, -0.3, 0.3, 0.9, 1.5):
        k.cyl(C["white"], 0.16, 2.4, (x, -1.75, 0.3), verts=10)
    k.box(C["lime"], (3.6, 0.9, 0.3), (0, -1.6, 2.7))
    gable(k, C["lime"], 3.6, 0.9, 3.0, pitch=24, ridge="x")
    k.cyl(C["white"], 1.2, 1.0, (0, 0.6, 2.9), verts=18)
    k.cyl("#ffffff", 1.22, 0.3, (0, 0.6, 3.25), "glow", verts=18)
    k.dome(C["white"], 1.2, (0, 0.6, 3.9), segments=18)
    k.cyl(C["gold"], 0.12, 0.7, (0, 0.6, 5.1), verts=8)
    for x in (-2.3, 2.3):
        k.cyl(C["steel"], 0.04, 2.6, (x, -2.4, 0.3), verts=6)
        k.box(C["blue"] if x < 0 else C["red"], (0.7, 0.04, 0.45), (x + 0.35, -2.4, 2.4))


def kms_bank_vault(k):
    """KMS key: a granite reserve bank with a gleaming round vault door behind its columns."""
    k.box(C["stone_dark"], (5.4, 4.4, 3.4), (0, 0.3, 0))
    for z in (0.8, 1.6, 2.4):
        k.box(C["stone"], (5.46, 4.46, 0.08), (0, 0.3, z))
    k.box(C["stone"], (5.7, 4.7, 0.35), (0, 0.3, 3.4))
    for x in (-1.9, -0.65, 0.65, 1.9):
        k.cyl(C["white"], 0.2, 2.9, (x, -2.25, 0.25), verts=10)
    k.box(C["stone"], (4.6, 0.6, 0.25), (0, -2.25, 0))
    k.cyl(C["steel"], 1.05, 0.25, (0, -1.95, 1.6), verts=24, rot=(math.pi / 2, 0, 0))
    k.torus("#ffffff", 1.05, 0.07, (0, -2.1, 1.6), "glow", rot=(math.pi / 2, 0, 0))
    for a in range(6):
        ang = a / 6 * math.tau
        k.box(C["gold"], (0.08, 0.1, 0.7), (math.cos(ang) * 0.4, -2.12, 1.6 + math.sin(ang) * 0.4), rot=(0, ang, 0))
    k.box("#ffffff", (1.4, 0.06, 0.3), (0, -2.0, 3.0), "neon")


def edge_broadcast_tower(k):
    """CloudFront / Route 53 / WAF: a lattice broadcast tower with dishes, sending content to the world."""
    k.box(C["brick"], (3.2, 3.2, 1.6), (0, 0, 0))
    k.window_grid(3.2, 3.2, 0.0, 1, 1.4, 3)
    top = 9.2
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        base = 1.1
        k.box(C["red"], (0.1, 0.1, top - 1.6), (sx * base * 0.55, sy * base * 0.55, 1.6), rot=(sy * math.radians(-6), sx * math.radians(6), 0))
    for z in (3.0, 4.6, 6.2, 7.6):
        s = 1.25 - (z - 1.6) / (top - 1.6) * 0.9
        k.box(C["white"], (s, 0.06, 0.06), (0, -s / 2, z))
        k.box(C["white"], (s, 0.06, 0.06), (0, s / 2, z))
        k.box(C["white"], (0.06, s, 0.06), (-s / 2, 0, z))
        k.box(C["white"], (0.06, s, 0.06), (s / 2, 0, z))
    for z, rot in ((4.2, 0.5), (6.0, -0.6)):
        k.dome(C["white"], 0.55, (0.6, 0, z), segments=14, height_scale=0.35, rot=(0, math.pi / 2 + rot, 0))
    k.cyl(C["steel"], 0.05, 1.5, (0, 0, top), verts=6)
    k.sphere("#ffffff", 0.16, (0, 0, top + 1.6), "glow")


def messaging_subway(k):
    """SQS / SNS / EventBridge: a subway entrance with green globe lamps and a newsstand. Messages ride below."""
    k.box(C["paving"], (5.6, 4.6, 0.15), (0, 0, 0))
    k.box(C["black"], (2.4, 3.2, 0.1), (-1.0, 0.2, 0.12))
    for i in range(6):
        k.box(C["concrete"], (2.2, 0.4, 0.1), (-1.0, -1.2 + i * 0.5, 0.0 - i * 0.12))
    for x in (-2.25, 0.25):
        k.box(C["green"], (0.08, 3.2, 1.0), (x, 0.2, 0.15))
        k.cyl(C["green"], 0.05, 1.5, (x, -1.45, 0.15), verts=6)
        k.sphere("#ffffff", 0.2, (x, -1.45, 1.8), "neon")
    k.box(C["green"], (2.6, 0.08, 0.5), (-1.0, -1.45, 1.1))
    k.box(C["green"], (1.5, 1.4, 1.6), (1.6, 0.6, 0.15))
    k.box("#ffffff", (1.52, 0.9, 0.7), (1.6, 0.4, 0.6), "glow")
    k.box(C["red"], (1.9, 0.6, 0.1), (1.6, -0.25, 1.75), rot=(math.radians(-18), 0, 0))
    for i, color in enumerate((C["yellow"], C["blue"], C["pink"])):
        k.box(color, (0.35, 0.08, 0.5), (1.15 + i * 0.45, -0.15, 0.5))


def monitoring_clocktower(k):
    """CloudWatch: a brick clock tower that watches the time and the metrics of the whole district."""
    k.box(C["brick"], (2.6, 2.6, 1.0), (0, 0, 0))
    k.box(C["brick"], (2.0, 2.0, 6.0), (0, 0, 1.0))
    for z in (2.5, 4.0):
        k.box(C["stone"], (2.1, 2.1, 0.15), (0, 0, z))
    k.box(C["stone"], (2.3, 2.3, 1.6), (0, 0, 7.0))
    for ang in (0, math.pi / 2, math.pi, 1.5 * math.pi):
        x, y = math.sin(ang) * 1.17, -math.cos(ang) * 1.17
        k.cyl("#ffffff", 0.6, 0.06, (x, y, 7.8), "glow", verts=20, rot=(math.pi / 2, 0, ang))
        k.box(C["black"], (0.06, 0.04, 0.45), (x * 1.02, y * 1.02, 7.8), rot=(0, 0, ang))
    k.box(C["stone_dark"], (2.5, 2.5, 0.2), (0, 0, 8.6))
    k.cone(C["copper"], 1.7, 2.2, (0, 0, 8.8), verts=4)
    k.cyl(C["gold"], 0.05, 0.9, (0, 0, 11.0), verts=6)
    k.sphere("#ffffff", 0.14, (0, 0, 12.0), "neon")


def generic_bodega(k):
    """Any other AWS resource: a corner bodega with a wrap-around yellow awning and an OPEN sign."""
    k.box(C["brick"], (4.2, 4.2, 3.2), (0, 0, 0))
    k.box(C["stone"], (4.4, 4.4, 0.2), (0, 0, 3.2))
    k.window_grid(4.2, 4.2, 1.6, 1, 1.4, 3)
    k.box("#ffffff", (3.4, 0.06, 0.8), (0, -2.12, 0.3), "glow")
    k.box("#ffffff", (0.06, 3.4, 0.8), (-2.12, 0, 0.3), "glow")
    k.box(C["yellow"], (4.6, 0.9, 0.1), (0, -2.5, 1.35), rot=(math.radians(-15), 0, 0))
    k.box(C["yellow"], (0.9, 4.6, 0.1), (-2.5, 0, 1.35), rot=(0, math.radians(15), 0))
    k.box("#ffffff", (0.9, 0.06, 0.35), (1.0, -2.14, 1.0), "neon")
    for i, color in enumerate((C["red"], C["green"], C["orange"])):
        k.box(color, (0.55, 0.45, 0.35), (-1.3 + i * 0.65, -2.9, 0))
    hvac(k, 0.8, 0.6, 3.4)


# ---------------------------------------------------------------- plumbing and structure
def subnet_lot(k):
    """Subnet: a pocket park. Paved square, planter tree, benches and a lamp."""
    k.box(C["paving"], (5.2, 5.2, 0.12), (0, 0, 0))
    k.cyl(C["stone"], 1.0, 0.4, (0, 0, 0.12), verts=16)
    k.cyl(C["leaf"], 0.95, 0.06, (0, 0, 0.5), verts=16)
    k.cyl(C["wood"], 0.12, 1.2, (0, 0, 0.5), verts=6)
    k.sphere(C["leaf"], 0.9, (0, 0, 2.1), segments=10, rings=6)
    for x in (-1.8, 1.8):
        k.box(C["wood"], (1.1, 0.4, 0.1), (x, -1.7, 0.5))
        k.box(C["black"], (0.08, 0.35, 0.5), (x - 0.45, -1.7, 0.12))
        k.box(C["black"], (0.08, 0.35, 0.5), (x + 0.45, -1.7, 0.12))
    k.cyl(C["black"], 0.05, 2.2, (2.0, 1.8, 0.12), verts=6)
    k.sphere("#ffffff", 0.16, (2.0, 1.8, 2.4), "glow")


def street_sign(k):
    """Route table: a corner signal mast with crossed street signs. It tells packets which way to turn."""
    k.cyl(C["black"], 0.08, 3.2, (0, 0, 0), verts=8)
    k.box(C["green"], (1.4, 0.05, 0.3), (0.5, 0, 2.6))
    k.box(C["green"], (0.05, 1.4, 0.3), (0, 0.5, 2.9))
    k.box(C["black"], (1.6, 0.08, 0.08), (0.8, 0, 3.15))
    k.box(C["black"], (0.3, 0.3, 0.8), (1.5, 0, 2.4))
    for i, z in enumerate((3.05, 2.8, 2.55)):
        k.sphere("#ffffff", 0.08, (1.5, -0.17, z), "neon" if i == 2 else "glow")


def fire_hydrant(k):
    """Associations and attachments: a red fire hydrant. Small, everywhere, holding things together."""
    k.cyl(C["red"], 0.32, 0.9, (0, 0, 0), verts=12)
    k.dome(C["red"], 0.33, (0, 0, 0.9), segments=12)
    k.cyl(C["steel"], 0.12, 0.25, (0, 0, 1.2), verts=8)
    for a in (0, math.pi):
        k.cyl(C["red"], 0.12, 0.25, (math.cos(a) * 0.32, 0, 0.55), verts=8, rot=(0, math.pi / 2, 0))
    k.box(C["paving"], (1.0, 1.0, 0.06), (0, 0, 0))


def payphone(k):
    """Elastic IP: a city phone booth with a number that stays put when you move."""
    k.box(C["blue"], (1.2, 1.2, 2.4), (0, 0, 0))
    k.box("#ffffff", (1.0, 0.06, 1.5), (0, -0.62, 0.6), "glow")
    k.box("#ffffff", (0.9, 0.05, 0.25), (0, -0.63, 2.1), "neon")
    k.box(C["steel"], (1.3, 1.3, 0.15), (0, 0, 2.4))


def vpc_boundary(k):
    """VPC: the district gateway arch. Two brick pylons with lamps and a glowing welcome sign."""
    for x in (-2.1, 2.1):
        k.box(C["brick"], (0.9, 0.9, 3.4), (x, 0, 0))
        k.box(C["stone"], (1.1, 1.1, 0.25), (x, 0, 3.4))
        k.cyl(C["black"], 0.05, 0.4, (x, 0, 3.65), verts=6)
        k.sphere("#ffffff", 0.2, (x, 0, 4.2), "glow")
    k.box(C["steel_dark"], (4.4, 0.4, 0.5), (0, 0, 3.0))
    k.box("#ffffff", (3.0, 0.08, 0.35), (0, -0.25, 3.07), "neon")


def taxi_stand(k):
    """Target group: a taxi stand. The load balancer sends riders to whichever cab is waiting."""
    yellow_cab(k)
    k.cyl(C["black"], 0.05, 2.2, (-1.6, -1.0, 0), verts=6)
    k.box(C["cab"], (0.7, 0.05, 0.5), (-1.6, -1.0, 2.0))


def region_marker(k):
    """Region: a granite obelisk monument at the edge of each region's island."""
    k.box(C["stone_dark"], (1.8, 1.8, 0.5), (0, 0, 0))
    k.box(C["stone"], (1.2, 1.2, 0.6), (0, 0, 0.5))
    k.cyl(C["lime"], 0.45, 4.5, (0, 0, 1.1), verts=4, top=0.25, rot=(0, 0, math.pi / 4))
    k.cone(C["gold"], 0.32, 0.5, (0, 0, 5.6), verts=4)
    for x, y in ((-0.8, -0.8), (0.8, -0.8), (-0.8, 0.8), (0.8, 0.8)):
        k.sphere("#ffffff", 0.12, (x, y, 0.65), "glow")


def az_marker(k):
    """Availability zone: a neighbourhood corner. Blue mailbox and a district sign on a lamp post."""
    k.box(C["blue"], (0.5, 0.5, 0.9), (0.6, 0, 0))
    k.dome(C["blue"], 0.25, (0.6, 0, 0.9), segments=10)
    k.cyl(C["green"], 0.05, 2.4, (-0.3, 0, 0), verts=6)
    k.box(C["green"], (0.9, 0.05, 0.3), (0.1, 0, 2.0))
    k.sphere("#ffffff", 0.15, (-0.3, 0, 2.55), "glow")


# ---------------------------------------------------------------- street props (decoration only)
def yellow_cab(k):
    k.box(C["cab"], (2.2, 1.0, 0.55), (0, 0, 0.25))
    k.box(C["cab"], (1.2, 0.95, 0.45), (-0.1, 0, 0.8))
    k.box(C["glass_dark"], (1.22, 0.97, 0.3), (-0.1, 0, 0.85))
    k.box(C["black"], (2.22, 1.02, 0.08), (0, 0, 0.55))
    k.box("#ffffff", (0.4, 0.2, 0.14), (-0.1, 0, 1.25), "glow")
    wheels(k, (-0.7, 0.7), 0.5, r=0.18)


def food_cart(k):
    k.box(C["steel"], (1.4, 0.8, 0.75), (0, 0, 0.3))
    k.box("#ffffff", (1.0, 0.04, 0.3), (0, -0.42, 0.65), "glow")
    wheels(k, (-0.45,), 0.4, r=0.22)
    k.cyl(C["steel"], 0.03, 1.4, (0, 0, 1.05), verts=6)
    k.cone(C["red"], 1.0, 0.45, (0, 0, 2.3), verts=8, rot=(0, 0, math.pi / 8))
    k.cone(C["yellow"], 0.7, 0.33, (0, 0, 2.38), verts=8, rot=(0, 0, math.pi / 8))
    k.cyl(C["steel"], 0.04, 0.75, (0.75, 0, 0), verts=6)


def cafe(k):
    k.box(C["brick"], (4.6, 2.2, 2.4), (0, 1.0, 0))
    k.box("#ffffff", (3.4, 0.06, 1.0), (0, -0.12, 0.3), "glow")
    k.box(C["red"], (4.6, 1.0, 0.1), (0, -0.6, 1.6), rot=(math.radians(-15), 0, 0))
    k.box("#ffffff", (1.6, 0.06, 0.32), (0, -0.14, 2.0), "neon")
    gable(k, C["slate"], 4.6, 2.2, 2.4, pitch=22)
    for i, x in enumerate((-1.6, 0.0, 1.6)):
        k.cyl(C["white"], 0.4, 0.05, (x, -1.9, 0.7), verts=10)
        k.cyl(C["steel"], 0.04, 0.7, (x, -1.9, 0), verts=6)
        k.cone((C["green"], C["white"], C["green"])[i], 0.75, 0.35, (x, -1.9, 1.55), verts=8)
        k.cyl(C["steel"], 0.03, 0.85, (x, -1.9, 0.7), verts=6)


def shop_row(k):
    facades = [(C["brick"], C["red"]), (C["lime"], C["green"]), (C["blue"], C["yellow"])]
    for i, (wall, awn) in enumerate(facades):
        x = -1.7 + i * 1.7
        h = 2.4 + (i % 2) * 0.8
        k.box(wall, (1.65, 3.2, h), (x, 0.4, 0))
        k.box(C["stone"], (1.75, 3.3, 0.15), (x, 0.4, h))
        k.box("#ffffff", (1.2, 0.06, 0.8), (x, -1.22, 0.3), "glow")
        k.box(awn, (1.5, 0.7, 0.08), (x, -1.55, 1.3), rot=(math.radians(-15), 0, 0))
        k.box("#ffffff", (0.9, 0.05, 0.22), (x, -1.23, 1.6), "neon" if i % 2 else "glow")


FACTORIES = {
    "ec2-walkup.glb": ec2_walkup,
    "ec2-midrise.glb": ec2_midrise,
    "ec2-skyscraper.glb": ec2_skyscraper,
    "ec2-supertall.glb": ec2_supertall,
    "rds-dome.glb": rds_dome,
    "dynamodb-refinery.glb": dynamodb_refinery,
    "s3-warehouse.glb": s3_warehouse,
    "lambda-food-truck.glb": lambda_food_truck,
    "containers-port.glb": containers_port,
    "lb-plaza.glb": lb_plaza,
    "igw-bridge-tower.glb": igw_bridge_tower,
    "nat-tollbooth.glb": nat_tollbooth,
    "sg-checkpoint.glb": sg_checkpoint,
    "iam-city-hall.glb": iam_city_hall,
    "kms-bank-vault.glb": kms_bank_vault,
    "edge-broadcast-tower.glb": edge_broadcast_tower,
    "messaging-subway.glb": messaging_subway,
    "monitoring-clocktower.glb": monitoring_clocktower,
    "generic-bodega.glb": generic_bodega,
    "subnet-lot.glb": subnet_lot,
    "street-sign.glb": street_sign,
    "fire-hydrant.glb": fire_hydrant,
    "payphone.glb": payphone,
    "vpc-boundary.glb": vpc_boundary,
    "taxi-stand.glb": taxi_stand,
    "region-island.glb": region_marker,
    "az-district.glb": az_marker,
    "prop-yellow-cab.glb": yellow_cab,
    "prop-food-cart.glb": food_cart,
    "prop-cafe.glb": cafe,
    "prop-shop-row.glb": shop_row,
}

# Resource key -> (file, scale). Keys match worlds/modern-city/resources.md.
LANDMARK = 0.42
SMALL = 0.36
MODELS = {
    "structure:region": ("region-island.glb", LANDMARK),
    "structure:az": ("az-district.glb", LANDMARK),
    "structure:vpc": ("vpc-boundary.glb", LANDMARK),
    "structure:subnet": ("subnet-lot.glb", LANDMARK),
    "family:compute": ("ec2-midrise.glb", LANDMARK),
    "family:containers": ("containers-port.glb", LANDMARK),
    "family:serverless": ("lambda-food-truck.glb", LANDMARK),
    "family:database": ("rds-dome.glb", LANDMARK),
    "family:storage": ("s3-warehouse.glb", LANDMARK),
    "family:gateway": ("igw-bridge-tower.glb", LANDMARK),
    "family:loadbalancer": ("lb-plaza.glb", LANDMARK),
    "family:edge": ("edge-broadcast-tower.glb", LANDMARK),
    "family:messaging": ("messaging-subway.glb", LANDMARK),
    "family:security": ("kms-bank-vault.glb", LANDMARK),
    "family:monitoring": ("monitoring-clocktower.glb", LANDMARK),
    "family:generic": ("generic-bodega.glb", LANDMARK),
    "aws_instance": ("ec2-midrise.glb", LANDMARK),
    "aws_instance.tiny": ("ec2-walkup.glb", LANDMARK),
    "aws_instance.small": ("ec2-midrise.glb", LANDMARK),
    "aws_instance.large": ("ec2-skyscraper.glb", LANDMARK),
    "aws_instance.huge": ("ec2-supertall.glb", LANDMARK),
    "aws_s3_bucket": ("s3-warehouse.glb", LANDMARK),
    "aws_db_instance": ("rds-dome.glb", LANDMARK),
    "aws_dynamodb_table": ("dynamodb-refinery.glb", LANDMARK),
    "aws_lambda_function": ("lambda-food-truck.glb", LANDMARK),
    "aws_lb": ("lb-plaza.glb", LANDMARK),
    "aws_nat_gateway": ("nat-tollbooth.glb", LANDMARK),
    "aws_internet_gateway": ("igw-bridge-tower.glb", LANDMARK),
    "aws_security_group": ("sg-checkpoint.glb", LANDMARK),
    "aws_iam_role": ("iam-city-hall.glb", LANDMARK),
    "aws_kms_key": ("kms-bank-vault.glb", LANDMARK),
    "aws_sqs_queue": ("messaging-subway.glb", LANDMARK),
    "aws_route53_zone": ("edge-broadcast-tower.glb", LANDMARK),
    "aws_vpc": ("vpc-boundary.glb", LANDMARK),
    "aws_subnet": ("subnet-lot.glb", LANDMARK),
    "aws_route_table": ("street-sign.glb", SMALL),
    "aws_route_table_association": ("fire-hydrant.glb", SMALL),
    "aws_lb_target_group_attachment": ("fire-hydrant.glb", SMALL),
    "aws_db_subnet_group": ("fire-hydrant.glb", SMALL),
    "aws_eip": ("payphone.glb", SMALL),
    "aws_lb_target_group": ("taxi-stand.glb", SMALL),
}
PROPS = [
    {"key": "prop:yellow-cab", "file": "prop-yellow-cab.glb", "placement": "road", "perDistrict": 3, "scale": 0.34},
    {"key": "prop:food-cart", "file": "prop-food-cart.glb", "placement": "sidewalk", "perDistrict": 2, "scale": 0.3},
    {"key": "prop:cafe", "file": "prop-cafe.glb", "placement": "lot", "perDistrict": 1, "scale": 0.44},
    {"key": "prop:shop-row", "file": "prop-shop-row.glb", "placement": "lot", "perDistrict": 1, "scale": 0.44},
]

kit = Kit(OUT, glow="#ffd479", neon="#5ff0e6")
info = {i["file"]: i for i in kit.build_all(FACTORIES)}

library = {
    "version": 1,
    "id": WORLD,
    "name": "Modern City",
    "referenceImages": ["docs/images/City-Theme.jpeg"],
    "palette": {"sky": "#bfe6fb", "ground": "#7bc043", "earth": "#c8794a", "base": "#d8c3a5", "roof": "#4f5d73", "accent": "#f3a6c8", "glow": "#ffd479"},
    "scene": {
        "background": "#bfe6fb", "ground": "#7bc043", "earth": "#c8794a", "base": "#d8c3a5", "roof": "#cfd3dc",
        "accent": "#f3a6c8", "glow": "#ffd479", "skyLight": "#d9f1ff", "groundLight": "#8a7a5a", "keyLight": "#fff1d6",
        "keyIntensity": 2.4, "fillIntensity": 0.9, "decor": "blossom", "fog": 1.0,
    },
    "nightScene": {
        "background": "#07142d", "ground": "#1d3b36", "earth": "#26304f", "base": "#33445d", "roof": "#254d65",
        "accent": "#5eead4", "glow": "#7df9ff", "skyLight": "#263d78", "groundLight": "#0b1224", "keyLight": "#819cff",
        "keyIntensity": 1.0, "fillIntensity": 0.45, "decor": "blossom", "fog": 1.0,
    },
    "streets": {
        "road": "#3a3d4a", "sidewalk": "#dcd5c6", "marking": "#f2c94c", "crosswalk": "#f3efe6",
        "lampPost": "#4a5563", "lampGlow": "#ffd479", "lightPools": False,
    },
    "lighting": {"preset": "day"},
    "camera": {"elevation": 36, "yaw": 45, "minDistance": 7, "maxDistance": 140},
    "models": {
        key: {"file": "models/" + f, "scale": s, "yOffset": 0, "height": round(info[f]["height"] * s, 2)}
        for key, (f, s) in MODELS.items()
    },
    "props": [
        {"file": "models/" + p["file"], "placement": p["placement"], "perDistrict": p["perDistrict"], "scale": p["scale"]}
        for p in PROPS
    ],
    "preview": "preview.webp",
}
with open(os.path.join(REPO, "public/worlds", WORLD, "library.json"), "w") as fh:
    json.dump(library, fh, indent=2)
    fh.write("\n")

print("EXPORTED", len(info))
for f, i in sorted(info.items()):
    print(f"{f:28s} {i['bytes']:>7d} B  tris {i['triangles']:>5d}  h {i['height']:>5.1f}  fp {i['footprint']:>4.1f}")
