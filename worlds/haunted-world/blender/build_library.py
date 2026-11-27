"""Haunted World: a vampire estate built from your AWS plan.

Run through the Blender MCP:
    exec(open("<repo>/worlds/haunted-world/blender/build_library.py").read())

Builds every model listed in worlds/haunted-world/resources.md with the shared kit, exports Draco GLBs to
public/worlds/haunted-world/models/, then writes public/worlds/haunted-world/library.json with measured heights.
Original geometry only, never shared with another world. Blender Z is up; fronts face -Y.
"""
import json
import math
import os

REPO = "/Users/zahidkamil/Documents/Learning/KiroweenHackathon/CloudWorld/CloudWorld"
exec(open(os.path.join(REPO, "worlds/_shared/blender/cw_kit.py")).read())

WORLD = "haunted-world"
OUT = os.path.join(REPO, "public/worlds", WORLD, "models")
W = "#ffffff"  # colour placeholder for emissive parts (the kit uses the glow / neon colour)

C = {
    "stone": "#6b6f8e", "stone_dark": "#4b4e6a", "stone_light": "#8a8fae", "slate": "#3c4f9c", "slate_dark": "#2c3a78",
    "wood": "#5a3d2b", "wood_dark": "#3b2a22", "iron": "#26252f", "pumpkin": "#e8741c", "pumpkin_dark": "#b9531a",
    "stem": "#4c6b2f", "bone": "#d9d2c0", "moss": "#3f5a4a", "velvet": "#8e1b2a", "frost": "#a9b4d6",
    "siding": "#5d5470", "siding_dark": "#463f58", "banner": "#2d4fb0", "gold": "#c99a3e", "earth": "#3a3046",
    "bark": "#3a2f35", "cobble": "#55526a", "candle": "#efe3c2", "black": "#16151c",
}


# ---------------------------------------------------------------- gothic helpers
def arch_window(k, x, y, z, w, h, face="front", role="glow"):
    """Pointed-arch window: a lit pane with a diamond tip and a stone sill, on the given face point."""
    s = w * 0.7071
    if face in ("front", "back"):
        k.box(W, (w, 0.08, h), (x, y, z), role)
        k.box(W, (s, 0.08, s), (x, y, z + h - s / 2), role, rot=(0, math.pi / 4, 0))
        k.box(C["stone_light"], (w + 0.2, 0.16, 0.08), (x, y, z - 0.08))
    else:
        k.box(W, (0.08, w, h), (x, y, z), role)
        k.box(W, (0.08, s, s), (x, y, z + h - s / 2), role, rot=(math.pi / 4, 0, 0))
        k.box(C["stone_light"], (0.16, w + 0.2, 0.08), (x, y, z - 0.08))


def window_rows(k, w, d, z0, floors, fh, cols, sides=("front", "left", "right", "back"), win=0.36, skip=()):
    for f in range(floors):
        z = z0 + f * fh + fh * 0.22
        h = fh * 0.5
        for c in range(cols):
            if (f, c) in skip:
                continue
            t = (c + 0.5) / cols - 0.5
            for side in sides:
                if side == "front":
                    arch_window(k, t * w, -d / 2 - 0.03, z, win, h, "front")
                elif side == "back":
                    arch_window(k, t * w, d / 2 + 0.03, z, win, h, "back")
                elif side == "left":
                    arch_window(k, -w / 2 - 0.03, t * d, z, win, h, "left")
                else:
                    arch_window(k, w / 2 + 0.03, t * d, z, win, h, "right")


def crenellate(k, color, w, d, z, size=0.32, gap=0.34, cx=0.0, cy=0.0):
    """Merlons along the top edge of a w x d wall block."""
    step = size + gap
    for sx in range(int(w / step) + 1):
        x = cx - w / 2 + size / 2 + sx * step
        if x > cx + w / 2 - size / 2 + 1e-6:
            break
        for y in (cy - d / 2 + size / 2, cy + d / 2 - size / 2):
            k.box(color, (size, size, size), (x, y, z))
    for sy in range(1, int(d / step)):
        y = cy - d / 2 + size / 2 + sy * step
        if y > cy + d / 2 - size:
            break
        for x in (cx - w / 2 + size / 2, cx + w / 2 - size / 2):
            k.box(color, (size, size, size), (x, y, z))


def turret(k, x, y, z, r, h, roof_h, roof=None, slits=True, verts=10):
    k.cyl(C["stone"], r, h, (x, y, z), verts=verts)
    k.cyl(C["stone_dark"], r + 0.08, 0.18, (x, y, z + h), verts=verts)
    k.cyl(roof or C["slate"], r + 0.16, roof_h, (x, y, z + h + 0.18), verts=verts, top=0.0)
    k.cyl(C["iron"], 0.03, 0.5, (x, y, z + h + 0.18 + roof_h - 0.05), verts=5)
    if slits:
        arch_window(k, x, y - r - 0.01, z + h * 0.55, 0.18, 0.5, "front")


def jack_o_lantern(k, x, y, z, r=0.32, lit=True):
    k.sphere(C["pumpkin"], r, (x, y, z + r * 0.8), scale=(1, 1, 0.8), segments=10, rings=6)
    k.cyl(C["stem"], 0.04, 0.16, (x, y, z + r * 1.5), verts=5)
    if lit:  # two eyes and a grin facing front
        for ex in (-0.35, 0.35):
            k.box(W, (r * 0.26, 0.06, r * 0.22), (x + ex * r, y - r * 0.93, z + r * 0.9), "glow", rot=(0, math.pi / 4, 0))
        k.box(W, (r * 0.8, 0.06, r * 0.14), (x, y - r * 0.95, z + r * 0.45), "glow")


def candle(k, x, y, z, h=0.35):
    k.cyl(C["candle"], 0.06, h, (x, y, z), verts=6)
    k.sphere(W, 0.05, (x, y, z + h + 0.05), "glow", segments=6, rings=4)


def tombstone(k, x, y, z, w=0.6, h=0.75, tilt=0.0):
    k.box(C["stone_light"], (w, 0.18, h - w / 2), (x, y, z), rot=(tilt, 0, 0))
    k.cyl(C["stone_light"], w / 2, 0.18, (x, y - 0.09, z + h - w / 2 - 0.09), verts=10, rot=(math.pi / 2 + tilt, 0, 0))


def iron_spikes(k, x0, x1, y, z, n, h=0.9, axis="x"):
    for i in range(n):
        t = x0 + (x1 - x0) * i / max(1, n - 1)
        px, py = (t, y) if axis == "x" else (y, t)
        k.box(C["iron"], (0.06, 0.06, h), (px, py, z))
        k.cone(C["iron"], 0.07, 0.18, (px, py, z + h), verts=4)
    if axis == "x":
        for zz in (z + 0.2, z + h - 0.15):
            k.box(C["iron"], (abs(x1 - x0), 0.04, 0.05), ((x0 + x1) / 2, y, zz))
    else:
        for zz in (z + 0.2, z + h - 0.15):
            k.box(C["iron"], (0.04, abs(x1 - x0), 0.05), (y, (x0 + x1) / 2, zz))


def hanging_lantern(k, x, y, z):
    k.box(C["iron"], (0.03, 0.03, 0.3), (x, y, z - 0.3))
    k.box(C["iron"], (0.26, 0.26, 0.05), (x, y, z - 0.35))
    k.box(W, (0.2, 0.2, 0.3), (x, y, z - 0.65), "glow")
    k.cone(C["iron"], 0.2, 0.16, (x, y, z - 0.35 - 0.02), verts=4)


def stone_door(k, x, y, w=0.7, h=1.2, glow=False):
    k.box(C["wood_dark"], (w, 0.1, h), (x, y, 0.0))
    k.box(C["wood_dark"], (w * 0.7071, 0.1, w * 0.7071), (x, y, h - w * 0.3536), rot=(0, math.pi / 4, 0))
    if glow:
        k.box(W, (w * 0.5, 0.12, 0.12), (x, y, h * 0.55), "glow")


# ---------------------------------------------------------------- EC2, sized by instance type
def ec2_cottage(k):
    """nano / micro: a crooked stone cottage with a steep slate roof, one glowing window, a leaning chimney."""
    k.box(C["stone_dark"], (3.8, 3.2, 0.3), (0, 0, 0))
    k.box(C["stone"], (3.2, 2.6, 2.3), (0, 0.1, 0.3))
    for x in (-1.6, 1.6):
        for y in (-1.2, 1.4):
            k.box(C["stone_light"], (0.22, 0.22, 2.3), (x, y, 0.3))
    k.prism(C["slate"], 3.7, 3.2, 2.2, (0, 0.1, 2.6))
    k.box(C["slate_dark"], (3.8, 0.12, 0.12), (0, 0.1, 4.78))
    arch_window(k, -0.8, -1.23, 1.1, 0.5, 0.8)
    arch_window(k, 1.63, 0.2, 1.1, 0.45, 0.7, "right")
    stone_door(k, 0.55, -1.22, 0.62, 1.4)
    k.box(C["stone_dark"], (0.55, 0.55, 2.0), (-1.0, 0.7, 3.4), rot=(0, math.radians(-8), 0))
    k.box(W, (0.4, 0.4, 0.08), (-1.15, 0.7, 5.35), "glow")
    jack_o_lantern(k, 1.3, -1.9, 0.3, 0.3)
    jack_o_lantern(k, -1.6, -1.95, 0.3, 0.22, lit=False)
    iron_spikes(k, -1.9, 1.9, -2.5, 0.0, 9, 0.7)


def ec2_victorian(k):
    """small / medium: a tall Victorian house with a witch-hat turret, wrap-around porch and lit gables."""
    k.box(C["stone_dark"], (4.8, 4.2, 0.35), (0, 0, 0))
    k.box(C["siding"], (3.6, 3.0, 4.4), (-0.3, 0.4, 0.35))
    for z in (0.35, 2.55):
        k.box(C["siding_dark"], (3.7, 3.1, 0.15), (-0.3, 0.4, z + 2.1))
    window_rows(k, 3.6, 3.0, 0.35, 2, 2.2, 2, sides=("front", "left"), win=0.42, skip=((0, 1),))
    k.prism(C["slate"], 4.0, 3.4, 2.4, (-0.3, 0.4, 4.75))
    k.prism(C["slate_dark"], 1.6, 1.8, 1.6, (-1.1, -0.85, 4.0), ridge="y")
    arch_window(k, -1.1, -1.8, 4.2, 0.4, 0.6)
    turret(k, 1.75, -1.15, 0.35, 0.85, 5.8, 2.6, roof=C["slate_dark"], slits=False, verts=8)
    arch_window(k, 1.75, -2.02, 2.0, 0.36, 0.9)
    arch_window(k, 1.75, -2.02, 4.1, 0.36, 0.9)
    k.box(C["wood"], (3.8, 1.0, 0.2), (-0.5, -1.6, 0.35))
    for x in (-2.2, -1.1, 0.0):
        k.box(C["bone"], (0.12, 0.12, 1.5), (x, -2.0, 0.55))
    k.box(C["slate_dark"], (2.8, 1.2, 0.12), (-1.0, -1.65, 2.05), rot=(math.radians(-14), 0, 0))
    stone_door(k, -0.6, -1.13, 0.6, 1.3, glow=True)
    k.box(C["stone_dark"], (0.5, 0.5, 2.6), (-1.4, 1.2, 5.2))
    jack_o_lantern(k, 0.6, -2.3, 0.35, 0.28)


def ec2_gated_manor(k):
    """large / xlarge: a three-storey gated manor with two wings, a central tower and a great iron gate."""
    k.box(C["cobble"], (5.8, 5.8, 0.2), (0, 0, 0))
    # wings and hall
    for x in (-2.0, 2.0):
        k.box(C["stone"], (1.6, 3.0, 4.6), (x, 1.0, 0.2))
        k.prism(C["slate"], 1.9, 3.2, 1.8, (x, 1.0, 4.8), ridge="y")
        window_rows(k, 1.6, 3.0, 0.2, 2, 2.1, 1, sides=("front",), win=0.45)
    k.box(C["stone"], (2.4, 3.2, 6.4), (0, 1.1, 0.2))
    window_rows(k, 2.4, 3.2, 0.2, 3, 2.1, 2, sides=("front",), win=0.42, skip=((0, 0), (0, 1)))
    k.prism(C["slate"], 2.7, 3.5, 2.0, (0, 1.1, 6.6))
    k.box(C["stone_dark"], (1.3, 1.3, 2.6), (0, -0.25, 6.6))
    arch_window(k, 0, -0.92, 7.3, 0.4, 1.0)
    k.cyl(C["slate_dark"], 0.95, 3.0, (0, -0.25, 9.2), verts=4, top=0.0, rot=(0, 0, math.pi / 4))
    k.cyl(C["iron"], 0.04, 0.8, (0, -0.25, 12.1), verts=5)
    stone_door(k, 0, -0.52, 0.9, 1.6, glow=True)
    # chimneys
    for x in (-2.3, 2.3):
        k.box(C["stone_dark"], (0.45, 0.45, 1.6), (x, 1.8, 5.6))
    # the great gate: two pillars with lanterns and an arched iron gate between
    for x in (-1.25, 1.25):
        k.box(C["stone_dark"], (0.7, 0.7, 2.6), (x, -2.5, 0.2))
        k.box(C["stone_light"], (0.85, 0.85, 0.2), (x, -2.5, 2.8))
        k.box(W, (0.32, 0.32, 0.42), (x, -2.5, 3.0), "glow")
        k.cone(C["iron"], 0.3, 0.35, (x, -2.5, 3.42), verts=4)
    for i in range(9):
        x = -0.85 + i * 0.2125
        h = 1.9 + 0.5 * math.cos((x / 0.85) * math.pi / 2)
        k.box(C["iron"], (0.05, 0.05, h), (x, -2.5, 0.2))
        k.cone(C["iron"], 0.06, 0.16, (x, -2.5, 0.2 + h), verts=4)
    k.box(C["iron"], (1.8, 0.05, 0.07), (0, -2.5, 0.6))
    k.torus(C["iron"], 0.3, 0.035, (0, -2.5, 1.5), rot=(math.pi / 2, 0, 0), segments=12)
    iron_spikes(k, -2.85, -1.7, -2.5, 0.2, 4, 1.1)
    iron_spikes(k, 1.7, 2.85, -2.5, 0.2, 4, 1.1)


def ec2_dracula_castle(k):
    """2xlarge and up: Dracula's castle. Curtain walls, four witch-hat turrets, a towering keep and a spire."""
    k.cyl(C["earth"], 2.95, 0.6, (0, 0, 0), verts=9)
    k.cyl(C["stone_dark"], 2.7, 0.3, (0, 0, 0.6), verts=9)
    # curtain walls
    for (x, y, w, d) in ((0, -2.0, 4.0, 0.5), (0, 2.0, 4.0, 0.5), (-2.0, 0, 0.5, 4.0), (2.0, 0, 0.5, 4.0)):
        k.box(C["stone"], (w, d, 2.4), (x, y, 0.9))
        crenellate(k, C["stone"], w, d, 3.3, size=0.26, gap=0.3, cx=x, cy=y)
    # gatehouse
    k.box(C["stone_dark"], (1.6, 0.9, 3.4), (0, -2.1, 0.9))
    crenellate(k, C["stone_dark"], 1.6, 0.9, 4.3, size=0.26, gap=0.26, cx=0, cy=-2.1)
    k.box(W, (0.7, 0.1, 1.2), (0, -2.58, 0.9), "glow")
    k.box(W, (0.495, 0.1, 0.495), (0, -2.58, 1.85), "glow", rot=(0, math.pi / 4, 0))
    for x in (-0.55, 0.55):
        k.box(C["velvet"], (0.35, 0.06, 1.3), (x, -2.58, 2.6))
    # corner turrets
    for x in (-2.1, 2.1):
        for y in (-2.1, 2.1):
            turret(k, x, y, 0.9, 0.62, 4.0, 2.2, verts=10)
    # keep
    k.box(C["stone"], (2.6, 2.6, 8.5), (0, 0.3, 0.9))
    for z in (3.5, 6.5):
        k.box(C["stone_dark"], (2.7, 2.7, 0.18), (0, 0.3, z))
    window_rows(k, 2.6, 2.6, 3.7, 2, 2.4, 2, sides=("front", "left", "right"), win=0.36)
    crenellate(k, C["stone_dark"], 2.8, 2.8, 9.4, size=0.3, gap=0.3, cx=0, cy=0.3)
    k.box(C["stone_dark"], (2.8, 2.8, 0.2), (0, 0.3, 9.2))
    # spire tower and its little sister
    k.cyl(C["stone"], 0.72, 3.6, (0.2, 0.5, 9.4), verts=10)
    arch_window(k, 0.2, -0.24, 10.6, 0.3, 1.0, role="neon")
    k.cyl(C["slate_dark"], 0.95, 4.6, (0.2, 0.5, 13.0), verts=10, top=0.0)
    k.cyl(C["iron"], 0.04, 1.2, (0.2, 0.5, 17.5), verts=5)
    k.box(C["velvet"], (0.5, 0.03, 0.3), (0.45, 0.5, 18.3))
    turret(k, -1.15, -0.8, 9.4, 0.45, 2.2, 1.9, roof=C["slate"], slits=True, verts=8)
    # blood-red banners on the keep
    for x in (-0.8, 0.8):
        k.box(C["velvet"], (0.45, 0.06, 1.8), (x, -1.03, 6.9))


# ---------------------------------------------------------------- data
def rds_crypt_tower(k):
    """Database: the moon crypt. A great round tower, crenellated, under a witch-hat slate roof ringed with teal oculi."""
    k.cyl(C["stone_dark"], 2.8, 0.35, (0, 0, 0), verts=20)
    k.cyl(C["stone"], 2.4, 3.6, (0, 0, 0.35), verts=20)
    for z in (1.4, 2.6):
        k.cyl(C["stone_dark"], 2.45, 0.14, (0, 0, z), verts=20)
    for i in range(10):
        a = i / 10 * math.tau
        x, y = math.cos(a) * 2.42, math.sin(a) * 2.42
        k.sphere(W, 0.2, (x, y, 3.2), "neon", scale=(1, 1, 1), segments=8, rings=5)
        k.box(C["stone_light"], (0.3, 0.3, 1.1), (math.cos(a + 0.31) * 2.45, math.sin(a + 0.31) * 2.45, 0.35))
    k.cyl(C["stone_dark"], 2.6, 0.3, (0, 0, 3.95), verts=20)
    for i in range(14):
        a = i / 14 * math.tau
        k.box(C["stone"], (0.36, 0.36, 0.4), (math.cos(a) * 2.45, math.sin(a) * 2.45, 4.25), rot=(0, 0, a))
    k.cyl(C["slate"], 2.25, 3.4, (0, 0, 4.25), verts=16, top=0.0)
    k.cyl(C["iron"], 0.05, 0.9, (0, 0, 7.6), verts=5)
    k.sphere(W, 0.16, (0, 0, 8.6), "neon")
    stone_door(k, 0, -2.42, 1.0, 1.7, glow=True)
    for x in (-0.9, 0.9):
        candle(k, x, -2.75, 0.35, 0.45)


def dynamodb_cauldron_brewery(k):
    """Key-value database: a witch's brewery. Three giant iron cauldrons bubbling teal over orange fires."""
    k.box(C["cobble"], (5.8, 5.2, 0.25), (0, 0, 0))
    for i, (x, y, r) in enumerate(((-1.6, -0.9, 1.0), (1.4, -1.0, 0.9), (0.0, 1.3, 1.2))):
        for a in (0, 2.1, 4.2):  # stubby legs
            k.box(C["iron"], (0.14, 0.14, 0.55), (x + math.cos(a) * r * 0.7, y + math.sin(a) * r * 0.7, 0.25))
        k.cone(W, r * 0.6, 0.6, (x, y, 0.25), "glow", verts=6, rot=(0, 0, 0))
        k.sphere(C["iron"], r, (x, y, 0.8 + r * 0.8), scale=(1, 1, 0.8), segments=14, rings=8)
        k.torus(C["iron"], r * 0.88, 0.09, (x, y, 0.8 + r * 1.32), segments=16)
        k.cyl(W, r * 0.84, 0.06, (x, y, 0.8 + r * 1.28), "neon", verts=14)
        for j in range(3):  # bubbles
            a = j * 2.2 + i
            k.sphere(W, 0.1 + 0.04 * j, (x + math.cos(a) * r * 0.4, y + math.sin(a) * r * 0.4, 0.8 + r * 1.42 + j * 0.15), "neon", segments=6, rings=4)
    # stone chimney hood over the back cauldron
    k.box(C["stone_dark"], (0.8, 0.8, 5.4), (2.1, 1.9, 0.25))
    k.box(C["stone"], (1.0, 1.0, 0.25), (2.1, 1.9, 5.65))
    k.box(W, (0.5, 0.5, 0.1), (2.1, 1.9, 5.9), "glow")
    # wooden gantry with a hanging ladle
    for x in (-2.6, 2.6):
        k.box(C["wood"], (0.18, 0.18, 3.6), (x, -2.2, 0.25))
    k.box(C["wood"], (5.4, 0.2, 0.2), (0, -2.2, 3.85))
    hanging_lantern(k, 0.0, -2.2, 3.85)
    for i, x in enumerate((-2.4, -1.9)):
        k.cyl(C["wood"], 0.32, 0.75, (x, 2.2, 0.25), verts=10)
        k.cyl(C["iron"], 0.34, 0.06, (x, 2.2, 0.55), verts=10)


def s3_pumpkin_cellar(k):
    """Object storage: a pumpkin cellar dug into a mossy mound, stacked pumpkins and barrels at its door."""
    k.dome(C["moss"], 2.6, (0, 0.6, 0), segments=16, height_scale=0.65)
    k.box(C["stone"], (2.2, 1.4, 1.8), (0, -1.6, 0))
    k.prism(C["stone_dark"], 2.5, 1.6, 0.8, (0, -1.6, 1.8), ridge="y")
    stone_door(k, 0, -2.32, 1.0, 1.4)
    k.box(W, (0.6, 0.12, 0.1), (0, -2.35, 0.6), "glow")
    for (x, y, r) in ((-1.9, -2.0, 0.42), (-1.4, -2.4, 0.32), (-2.2, -1.2, 0.36), (1.5, -2.3, 0.4), (2.1, -1.6, 0.3)):
        k.sphere(C["pumpkin"] if r > 0.33 else C["pumpkin_dark"], r, (x, y, r * 0.75), scale=(1, 1, 0.75), segments=10, rings=6)
        k.cyl(C["stem"], 0.035, 0.14, (x, y, r * 1.4), verts=5)
    jack_o_lantern(k, 0.0, -0.4, 1.55, 0.55)
    for x in (1.9, 2.4):
        k.cyl(C["wood"], 0.3, 0.75, (x, -0.7, 0), verts=10)
        k.cyl(C["iron"], 0.32, 0.05, (x, -0.7, 0.55), verts=10)


# ---------------------------------------------------------------- compute neighbours
def lambda_wisp_lantern(k):
    """Serverless: a spectral lantern that floats above its plinth and flares teal when invoked."""
    k.cyl(C["stone_dark"], 1.3, 0.3, (0, 0, 0), verts=8)
    k.cyl(C["stone"], 0.7, 0.9, (0, 0, 0.3), verts=8, top=0.5)
    k.box(C["iron"], (0.9, 0.9, 0.08), (0, 0, 2.0))
    for x in (-0.4, 0.4):
        for y in (-0.4, 0.4):
            k.box(C["iron"], (0.06, 0.06, 1.3), (x, y, 2.0))
    k.cone(C["iron"], 0.7, 0.55, (0, 0, 3.3), verts=4)
    k.cyl(C["iron"], 0.12, 0.25, (0, 0, 3.8), verts=6)
    for i, (dx, dz, rz) in enumerate(((0, 0, -0.5), (0.1, 0.35, 0.5), (-0.05, 0.7, -0.5))):
        k.box(W, (0.16, 0.12, 0.45), (dx, 0, 2.2 + dz), "neon", rot=(0, rz, 0))
    for a in (0.4, 2.5, 4.4):
        k.sphere(W, 0.14, (math.cos(a) * 1.0, math.sin(a) * 1.0, 1.4 + a * 0.15), "neon", segments=6, rings=4)
    for a in (1.0, 3.6):
        candle(k, math.cos(a) * 1.05, math.sin(a) * 1.05, 0.3)


def containers_mausoleum_row(k):
    """Containers: a row of little mausoleums sharing one wall, each with a candle-lit door."""
    k.box(C["cobble"], (5.8, 4.4, 0.2), (0, 0, 0))
    k.box(C["stone_dark"], (5.6, 0.4, 1.2), (0, 1.8, 0.2))
    for i, x in enumerate((-1.9, 0.0, 1.9)):
        h = 2.0 + (i % 2) * 0.5
        k.box(C["stone"], (1.6, 2.2, h), (x, 0.4, 0.2))
        k.prism(C["slate"] if i % 2 else C["slate_dark"], 1.85, 2.4, 0.9, (x, 0.4, 0.2 + h), ridge="y")
        stone_door(k, x, -0.72, 0.7, 1.3)
        k.box(W, (0.3, 0.12, 0.3), (x, -0.74, 1.6), "glow")
        for cx in (-0.55, 0.55):
            k.box(C["stone_light"], (0.2, 0.2, h), (x + cx, -0.72, 0.2))
        candle(k, x + 0.5, -1.2, 0.2)
    tombstone(k, -2.3, -1.8, 0.2, 0.5, 0.65, 0.1)
    tombstone(k, 2.4, -1.7, 0.2, 0.5, 0.6, -0.12)


def lb_crossroads_gallows(k):
    """Load balancer: a crossroads gallows post with three hanging lanterns and arrow signs every way."""
    k.cyl(C["cobble"], 2.85, 0.15, (0, 0, 0), verts=16)
    k.cyl(C["stone"], 1.0, 0.5, (0, 0, 0.15), verts=10)
    k.box(C["wood_dark"], (0.35, 0.35, 4.6), (0, 0, 0.65))
    for a in (0.0, 2.1, 4.2):
        dx, dy = math.cos(a), math.sin(a)
        k.box(C["wood_dark"], (1.8, 0.22, 0.22), (dx * 0.9, dy * 0.9, 4.6), rot=(0, 0, a))
        k.box(C["wood_dark"], (0.9, 0.12, 0.12), (dx * 0.4, dy * 0.4, 4.0), rot=(0, math.radians(-40), a))
        hanging_lantern(k, dx * 1.65, dy * 1.65, 4.6)
    for i, a in enumerate((0.6, 1.9, 3.3, 5.0)):
        k.box(C["bone"], (1.2, 0.08, 0.28), (math.cos(a) * 0.6, math.sin(a) * 0.6, 2.2 + i * 0.4), rot=(0, 0, a))
        k.cone(C["bone"], 0.2, 0.3, (math.cos(a) * 1.25, math.sin(a) * 1.25, 2.2 + i * 0.4), verts=3, rot=(0, math.pi / 2, a))
    for a in (0.3, 1.8, 3.4, 4.9):
        jack_o_lantern(k, math.cos(a) * 2.2, math.sin(a) * 2.2, 0.15, 0.26)


def igw_castle_gate(k):
    """Internet gateway: the great gatehouse. Twin round towers, a raised portcullis, blue banners and torches."""
    k.box(C["cobble"], (5.8, 3.0, 0.2), (0, 0, 0))
    for x in (-2.0, 2.0):
        turret(k, x, 0.2, 0.2, 0.95, 4.6, 2.4, slits=True, verts=12)
        k.box(C["banner"], (0.6, 0.06, 1.6), (x, -0.8, 2.4))
        k.box(C["gold"], (0.2, 0.07, 0.2), (x, -0.83, 3.2))
    k.box(C["stone"], (3.0, 1.6, 4.2), (0, 0.3, 0.2))
    crenellate(k, C["stone"], 3.0, 1.6, 4.4, size=0.3, gap=0.3, cx=0, cy=0.3)
    k.box(C["black"], (1.5, 0.1, 2.0), (0, -0.52, 0.2))
    k.box(C["black"], (1.06, 0.1, 1.06), (0, -0.52, 1.65), rot=(0, math.pi / 4, 0))
    for i in range(6):
        k.box(C["iron"], (0.05, 0.06, 1.0), (-0.62 + i * 0.25, -0.58, 1.9))
    k.box(C["iron"], (1.5, 0.06, 0.06), (0, -0.58, 2.1))
    k.box(W, (1.1, 0.06, 0.3), (0, -0.53, 0.35), "glow")
    for x in (-1.0, 1.0):
        k.box(C["iron"], (0.08, 0.3, 0.08), (x, -0.65, 2.6))
        k.cone(W, 0.14, 0.35, (x, -0.8, 2.66), "glow", verts=5)


def nat_iron_gate(k):
    """NAT gateway: a heavy one-way iron gate set in a stone wall. It swings outward only, padlocked from inside."""
    k.box(C["cobble"], (5.8, 2.6, 0.15), (0, 0, 0))
    for x in (-2.0, 2.0):
        k.box(C["stone"], (1.8, 1.0, 2.4), (x, 0.4, 0.15))
        crenellate(k, C["stone"], 1.8, 1.0, 2.55, size=0.28, gap=0.3, cx=x, cy=0.4)
    for x in (-1.0, 1.0):
        k.box(C["stone_dark"], (0.5, 0.6, 3.0), (x, 0.4, 0.15))
        k.cone(C["slate_dark"], 0.45, 0.6, (x, 0.4, 3.15), verts=4)
    for i in range(6):  # gate swung open outward
        a = math.radians(-35)
        t = 0.1 + i * 0.13
        k.box(C["iron"], (0.05, 0.05, 2.2), (-0.75 + math.cos(a) * t, 0.4 + math.sin(a) * t, 0.15))
    k.box(C["iron"], (0.8, 0.05, 0.08), (-0.75 + math.cos(math.radians(-35)) * 0.4, 0.4 + math.sin(math.radians(-35)) * 0.4, 1.2), rot=(0, 0, math.radians(-35)))
    for i in range(6):
        k.box(C["iron"], (0.05, 0.05, 2.2), (0.12 + i * 0.13, 0.4, 0.15))
    k.box(C["gold"], (0.22, 0.12, 0.25), (0.75, 0.32, 1.1))
    k.box(W, (1.2, 0.06, 0.3), (0, -0.2, 2.7), "neon")
    k.cone(W, 0.25, 0.4, (0.75, -0.2, 2.75), "neon", verts=3, rot=(0, math.pi / 2, 0))


def sg_spiked_fence(k):
    """Security group: a ring of spiked iron posts with sagging chains and faint teal runes. Members stand inside."""
    for i in range(14):
        a = i / 14 * math.tau
        x, y = math.cos(a) * 2.5, math.sin(a) * 2.5
        k.box(C["iron"], (0.1, 0.1, 1.1), (x, y, 0))
        k.cone(C["iron"], 0.12, 0.28, (x, y, 1.1), verts=4)
        if i % 2 == 0:
            k.box(W, (0.12, 0.12, 0.18), (x, y, 0.65), "neon")
    k.torus(C["iron"], 2.5, 0.03, (0, 0, 0.85), segments=28)
    k.torus(C["iron"], 2.5, 0.025, (0, 0, 0.35), segments=28)
    k.box(C["stone_dark"], (0.6, 0.6, 1.4), (0, -2.5, 0))
    k.sphere(W, 0.18, (0, -2.5, 1.6), "glow")


def iam_banner_standard(k):
    """IAM role: a heraldic standard. A stone pillar on round steps with a long blue banner and a glowing crest."""
    for i, r in enumerate((1.7, 1.3, 0.95)):
        k.cyl(C["stone_dark"] if i % 2 == 0 else C["stone"], r, 0.25, (0, 0, i * 0.25), verts=12)
    k.box(C["stone"], (0.7, 0.7, 3.6), (0, 0, 0.75))
    k.box(C["stone_light"], (0.95, 0.95, 0.25), (0, 0, 4.35))
    k.cone(C["iron"], 0.25, 0.5, (0, 0, 4.6), verts=4)
    k.box(C["iron"], (1.8, 0.08, 0.08), (0.2, -0.45, 4.1))
    k.box(C["banner"], (1.2, 0.06, 2.6), (0.35, -0.45, 1.45))
    k.cone(C["banner"], 0.42, 0.45, (0.35, -0.45, 1.0), verts=3, rot=(math.pi / 2, 0, 0))
    k.box(C["gold"], (1.24, 0.07, 0.1), (0.35, -0.46, 3.9))
    k.cyl(W, 0.3, 0.06, (0.35, -0.5, 2.7 - 0.03), "neon", verts=10, rot=(math.pi / 2, 0, 0))
    for a in (0.8, 2.4, 4.0, 5.5):
        candle(k, math.cos(a) * 1.45, math.sin(a) * 1.45, 0.25)


def kms_crypt_vault(k):
    """KMS key: a sealed crypt with a glowing orange rune circle on its iron door and a giant iron key hung outside."""
    k.box(C["stone_dark"], (5.0, 4.0, 0.3), (0, 0.3, 0))
    k.box(C["stone"], (4.2, 3.4, 2.8), (0, 0.5, 0.3))
    for x in (-2.1, 2.1):
        k.box(C["stone_light"], (0.35, 3.5, 3.0), (x, 0.5, 0.3))
    k.prism(C["slate_dark"], 4.7, 3.8, 1.5, (0, 0.5, 3.1))
    k.prism(C["stone_light"], 1.8, 0.4, 0.9, (0, -1.25, 2.6), ridge="x")
    k.box(C["iron"], (1.5, 0.12, 2.0), (0, -1.25, 0.3))
    k.torus(W, 0.45, 0.05, (0, -1.33, 1.3), "glow", rot=(math.pi / 2, 0, 0), segments=18)
    for a in range(6):
        ang = a / 6 * math.tau
        k.box(W, (0.08, 0.06, 0.18), (math.cos(ang) * 0.3, -1.34, 1.3 + math.sin(ang) * 0.3), "glow", rot=(0, ang, 0))
    # the great key on a post
    k.box(C["iron"], (0.12, 0.12, 2.6), (1.9, -1.6, 0.3))
    k.torus(C["iron"], 0.28, 0.07, (1.9, -1.72, 2.3), rot=(math.pi / 2, 0, 0), segments=12)
    k.box(C["iron"], (0.1, 0.08, 1.0), (1.9, -1.72, 1.1))
    k.box(C["iron"], (0.3, 0.08, 0.12), (2.0, -1.72, 1.15))
    for x in (-1.5, -1.0):
        candle(k, x, -1.7, 0.3, 0.4)


def edge_bell_tower(k):
    """Edge (CloudFront, Route 53): the chapel bell tower. A glowing belfry and a spire whose bell calls across the land."""
    k.box(C["stone_dark"], (2.8, 2.8, 0.4), (0, 0, 0))
    k.box(C["stone"], (2.2, 2.2, 6.0), (0, 0, 0.4))
    for z in (2.4, 4.4):
        k.box(C["stone_dark"], (2.3, 2.3, 0.15), (0, 0, z))
    arch_window(k, 0, -1.13, 2.8, 0.4, 1.0)
    stone_door(k, 0, -1.12, 0.8, 1.6)
    k.box(C["stone_light"], (2.4, 2.4, 0.25), (0, 0, 6.4))
    for x, y, rz in ((-0.95, -0.95, 0), (0.95, -0.95, 0), (-0.95, 0.95, 0), (0.95, 0.95, 0)):
        k.box(C["stone"], (0.4, 0.4, 1.8), (x, y, 6.65))
    k.box(W, (1.4, 1.4, 1.5), (0, 0, 6.65), "glow")
    k.cyl(C["gold"], 0.45, 0.6, (0, 0, 7.4), verts=10, top=0.2)
    k.box(C["stone_light"], (2.5, 2.5, 0.25), (0, 0, 8.45))
    k.cone(C["slate"], 1.6, 4.2, (0, 0, 8.7), verts=4)
    for x, y in ((-1.1, -1.1), (1.1, -1.1), (-1.1, 1.1), (1.1, 1.1)):
        k.cone(C["slate_dark"], 0.22, 0.9, (x, y, 8.7), verts=4)
    k.cyl(C["iron"], 0.04, 1.0, (0, 0, 12.8), verts=5)
    k.sphere(W, 0.2, (0, 0, 14.0), "neon")


def messaging_raven_tree(k):
    """Messaging (SQS, SNS): a twisted dead tree where ravens wait with glowing letters until someone collects them."""
    k.cyl(C["earth"], 1.8, 0.3, (0, 0, 0), verts=10)
    segs = [(0, 0, 0.3, 0.42, 1.6, 0.12), (0.15, 0, 1.8, 0.33, 1.5, -0.2), (0.0, 0.05, 3.2, 0.25, 1.3, 0.15)]
    for x, y, z, r, h, tilt in segs:
        k.cyl(C["bark"], r, h, (x, y, z), verts=7, top=r * 0.75, rot=(tilt, tilt * 0.6, 0))
    branches = [(-0.2, 0, 2.4, 1.6, 0.9, 0.0), (0.25, 0, 3.0, 1.4, -0.85, 0.9), (0.0, 0, 3.9, 1.3, 0.6, 2.2), (0.0, 0, 4.2, 1.1, -0.6, 3.8)]
    tips = []
    for x, y, z, length, tilt, yaw in branches:
        k.cyl(C["bark"], 0.12, length, (x, y, z), verts=5, top=0.03, rot=(0, tilt, yaw))
        tips.append((x + math.sin(tilt) * length * 0.8 * math.cos(yaw), y + math.sin(tilt) * length * 0.8 * math.sin(yaw), z + math.cos(tilt) * length * 0.8))
    for i, (x, y, z) in enumerate(tips):  # ravens with letters
        k.sphere(C["black"], 0.18, (x, y, z + 0.1), scale=(1.4, 0.8, 0.9), segments=8, rings=5)
        k.cone(C["black"], 0.1, 0.25, (x + 0.2, y, z + 0.15), verts=4, rot=(0, math.pi / 2, 0))
        k.box(W, (0.22, 0.04, 0.15), (x - 0.15, y - 0.12, z), "glow", rot=(0, 0, 0.4 * i))
    k.box(C["wood"], (0.9, 0.7, 0.9), (1.1, -0.9, 0.3))
    k.box(C["wood_dark"], (1.0, 0.8, 0.1), (1.1, -0.9, 1.2))
    k.box(W, (0.5, 0.06, 0.3), (1.1, -1.27, 0.7), "glow")


def monitoring_angel_statue(k):
    """Monitoring (CloudWatch): a winged angel statue on a tall plinth, holding a glowing orb that sees everything."""
    k.cyl(C["stone_dark"], 1.4, 0.35, (0, 0, 0), verts=8)
    k.box(C["stone"], (1.3, 1.3, 2.2), (0, 0, 0.35))
    k.box(C["stone_light"], (1.5, 1.5, 0.22), (0, 0, 2.55))
    k.cyl(C["stone_light"], 0.55, 2.0, (0, 0, 2.77), verts=10, top=0.25)
    k.sphere(C["stone_light"], 0.32, (0, -0.05, 5.05), segments=10, rings=6)
    for s in (-1, 1):
        k.box(C["stone_light"], (0.12, 0.9, 1.8), (s * 0.5, 0.35, 3.3), rot=(math.radians(-20), s * math.radians(-28), 0))
        k.box(C["stone_light"], (0.1, 0.6, 1.0), (s * 0.85, 0.7, 4.0), rot=(math.radians(-35), s * math.radians(-40), 0))
    k.box(C["stone_light"], (0.14, 0.6, 0.14), (0.3, -0.4, 4.0), rot=(math.radians(30), 0, 0))
    k.sphere(W, 0.3, (0.3, -0.72, 4.3), "neon")
    k.box(W, (0.8, 0.06, 0.35), (0, -0.67, 1.2), "neon")
    for a in (0.7, 2.4):
        candle(k, math.cos(a) * 1.2, -math.sin(a) * 1.2, 0.35)


def generic_tombstone(k):
    """Any other AWS resource: a great rounded tombstone with a glowing orange rune and candles at its foot."""
    k.box(C["earth"], (3.6, 2.6, 0.25), (0, 0, 0))
    k.box(C["stone_dark"], (2.6, 1.0, 0.35), (0, 0, 0.25))
    k.box(C["stone_light"], (2.0, 0.55, 2.0), (0, 0, 0.6))
    k.cyl(C["stone_light"], 1.0, 0.55, (0, -0.275, 2.6 - 0.275), verts=16, rot=(math.pi / 2, 0, 0))
    k.cyl(W, 0.35, 0.06, (0, -0.33, 2.0 - 0.03), "glow", verts=10, rot=(math.pi / 2, 0, 0))
    k.box(W, (0.08, 0.06, 0.7), (0, -0.31, 1.65), "glow")
    for x in (-1.1, -0.8, 0.9, 1.2):
        candle(k, x, -0.75, 0.25, 0.3 + abs(x) * 0.1)
    jack_o_lantern(k, 1.3, 0.4, 0.25, 0.28, lit=False)


# ---------------------------------------------------------------- plumbing and structure
def subnet_graveyard(k):
    """Subnet: a frost-dusted graveyard yard with leaning tombstones, a bare tree and a lantern."""
    k.box(C["frost"], (5.2, 5.2, 0.12), (0, 0, 0))
    k.box(C["cobble"], (1.0, 5.2, 0.14), (0, 0, 0))
    for i, (x, y) in enumerate(((-1.6, -1.4), (-1.6, 0.3), (1.6, -1.2), (1.6, 0.6), (-1.6, 1.8))):
        tombstone(k, x, y, 0.12, 0.6, 0.8, (i % 3 - 1) * 0.12)
    k.cyl(C["bark"], 0.18, 2.2, (1.7, 1.9, 0.12), verts=6, top=0.08, rot=(0.15, 0, 0))
    k.cyl(C["bark"], 0.07, 1.0, (1.7, 2.1, 1.6), verts=5, top=0.02, rot=(0, 0.9, 0.5))
    k.box(C["iron"], (0.08, 0.08, 2.2), (0.7, -2.2, 0.12))
    hanging_lantern(k, 0.7, -2.2, 2.32)


def signpost_crooked(k):
    """Route table: a crooked wooden signpost with arrow boards pointing packets down the right lane."""
    k.box(C["wood_dark"], (0.18, 0.18, 2.8), (0, 0, 0), rot=(0.06, -0.05, 0))
    for i, (yaw, z) in enumerate(((0.3, 2.3), (2.4, 1.9), (4.0, 1.5))):
        k.box(C["bone"], (1.1, 0.07, 0.25), (math.cos(yaw) * 0.5, math.sin(yaw) * 0.5, z), rot=(0, 0, yaw))
    k.sphere(W, 0.12, (0, 0, 2.95), "glow")
    jack_o_lantern(k, 0.4, -0.3, 0, 0.22)


def candle_cluster(k):
    """Associations and attachments: a cluster of melting candles on a stone. Small, everywhere, holding the estate together."""
    k.cyl(C["stone_dark"], 0.55, 0.2, (0, 0, 0), verts=8)
    for (x, y, h) in ((0, 0, 0.6), (0.25, 0.15, 0.4), (-0.22, 0.2, 0.45), (0.1, -0.25, 0.3), (-0.2, -0.18, 0.35)):
        candle(k, x, y, 0.2, h)


def lantern_post(k):
    """Elastic IP: an iron gallows post with one hanging orange lantern. The light stays put when you move."""
    k.box(C["stone_dark"], (0.5, 0.5, 0.3), (0, 0, 0))
    k.box(C["iron"], (0.1, 0.1, 2.6), (0, 0, 0.3))
    k.box(C["iron"], (0.8, 0.08, 0.08), (0.35, 0, 2.8))
    k.box(C["iron"], (0.5, 0.06, 0.06), (0.18, 0, 2.55), rot=(0, math.radians(-45), 0))
    hanging_lantern(k, 0.7, 0, 2.8)


def coffin_row(k):
    """Target group: three coffins stood in a row, one lid ajar with light inside. The load balancer wakes whoever is ready."""
    def coffin(x, y, rot, open_lid=False):
        hw, hs, hl = 0.32, 0.42, 1.5
        v = [(-hw, -0.15, 0), (hw, -0.15, 0), (hs, -0.15, 0.95), (hw * 0.6, -0.15, hl), (-hw * 0.6, -0.15, hl), (-hs, -0.15, 0.95),
             (-hw, 0.15, 0), (hw, 0.15, 0), (hs, 0.15, 0.95), (hw * 0.6, 0.15, hl), (-hw * 0.6, 0.15, hl), (-hs, 0.15, 0.95)]
        v = [(x + px * math.cos(rot) - py * math.sin(rot), y + px * math.sin(rot) + py * math.cos(rot), pz) for px, py, pz in v]
        f = [(0, 1, 2, 3, 4, 5), (6, 11, 10, 9, 8, 7)] + [(i, (i + 1) % 6, (i + 1) % 6 + 6, i + 6) for i in range(6)]
        k.mesh(C["wood_dark"], v, f)
        if open_lid:
            k.box(W, (0.4, 0.06, 1.1), (x, y - 0.17, 0.2), "glow")
        k.box(C["gold"], (0.06, 0.04, 0.4), (x, y - 0.17, 0.9))
    coffin(-0.9, 0.2, 0.0)
    coffin(0.0, 0.0, 0.0, open_lid=True)
    coffin(0.9, 0.2, 0.0)
    k.box(C["earth"], (2.8, 1.0, 0.08), (0, 0.1, 0))


def vpc_wall_gate(k):
    """VPC: the estate wall. Crenellated stone with a pointed archway between two little watch turrets."""
    for x in (-1.9, 1.9):
        k.box(C["stone"], (1.4, 0.8, 2.6), (x, 0, 0))
        crenellate(k, C["stone"], 1.4, 0.8, 2.6, size=0.26, gap=0.28, cx=x, cy=0)
    for x in (-0.9, 0.9):
        turret(k, x, 0, 0, 0.45, 3.4, 1.4, slits=True, verts=8)
    k.box(C["stone_dark"], (1.4, 0.6, 0.5), (0, 0, 2.6))
    k.box(C["stone_dark"], (0.99, 0.6, 0.99), (0, 0, 2.1), rot=(0, math.pi / 4, 0))
    hanging_lantern(k, 0, 0, 2.6)


def region_gargoyle(k):
    """Region: a gargoyle pillar with an orange brazier, standing guard on each region's floating estate."""
    k.box(C["stone_dark"], (1.6, 1.6, 0.4), (0, 0, 0))
    k.box(C["stone"], (1.0, 1.0, 3.2), (0, 0, 0.4))
    k.box(C["stone_light"], (1.3, 1.3, 0.25), (0, 0, 3.6))
    k.sphere(C["stone_dark"], 0.45, (0, -0.3, 4.25), scale=(1, 1.3, 0.8), segments=8, rings=5)
    k.sphere(C["stone_dark"], 0.25, (0, -0.85, 4.45), segments=8, rings=5)
    for s in (-1, 1):
        k.box(C["stone_dark"], (0.08, 0.7, 0.6), (s * 0.45, -0.1, 4.4), rot=(0, s * 0.5, 0))
        k.cone(C["stone_dark"], 0.07, 0.25, (s * 0.12, -0.9, 4.6), verts=4)
    k.sphere(W, 0.08, (0.1, -1.08, 4.5), "glow", segments=6, rings=4)
    k.sphere(W, 0.08, (-0.1, -1.08, 4.5), "glow", segments=6, rings=4)


def az_lamp_shrine(k):
    """Availability zone: a little roadside shrine with a candle, the district's lantern on a post beside it."""
    k.box(C["stone"], (0.8, 0.6, 1.1), (0.4, 0, 0))
    k.prism(C["slate_dark"], 1.0, 0.8, 0.5, (0.4, 0, 1.1))
    k.box(W, (0.35, 0.08, 0.45), (0.4, -0.31, 0.35), "glow")
    k.box(C["iron"], (0.08, 0.08, 2.2), (-0.5, 0, 0))
    hanging_lantern(k, -0.5, 0, 2.3)


# ---------------------------------------------------------------- props (decoration only)
def prop_pumpkin_patch(k):
    for (x, y, r, lit) in ((0, 0, 0.42, True), (0.6, 0.35, 0.3, False), (-0.55, 0.3, 0.32, True), (0.25, 0.7, 0.26, False)):
        jack_o_lantern(k, x, y, 0, r, lit)
    candle(k, -0.5, -0.4, 0, 0.3)


def prop_hearse(k):
    k.box(C["black"], (2.0, 0.95, 0.9), (0, 0, 0.45))
    k.box(C["black"], (1.6, 0.85, 0.12), (-0.1, 0, 1.35))
    k.box(W, (1.0, 0.98, 0.45), (-0.1, 0, 0.7), "glow")
    k.box(C["velvet"], (1.1, 1.0, 0.12), (-0.1, 0, 0.65))
    for x in (-0.8, 0.7):
        for y in (-0.5, 0.5):
            k.cyl(C["wood_dark"], 0.32, 0.08, (x, y + (0.04 if y < 0 else -0.04), 0.32), verts=10, rot=(math.pi / 2, 0, 0))
    for y in (-0.5, 0.5):
        k.box(C["iron"], (0.05, 0.05, 0.4), (1.05, y, 1.0))
        k.sphere(W, 0.08, (1.05, y, 1.45), "glow", segments=6, rings=4)
    for x in (-0.8, 0.0, 0.6):
        k.cone(C["iron"], 0.06, 0.25, (x, 0, 1.47), verts=4)


def prop_graveyard(k):
    k.box(C["earth"], (4.4, 3.6, 0.1), (0, 0, 0))
    for i, (x, y) in enumerate(((-1.4, -0.8), (-0.4, -0.9), (0.6, -0.7), (1.5, -0.9), (-1.0, 0.6), (0.2, 0.7), (1.3, 0.6))):
        tombstone(k, x, y, 0.1, 0.5 + (i % 2) * 0.12, 0.65 + (i % 3) * 0.12, (i % 3 - 1) * 0.12)
        if i % 2 == 0:
            candle(k, x + 0.3, y - 0.3, 0.1, 0.25)
    iron_spikes(k, -2.1, 2.1, -1.65, 0.1, 10, 0.6)
    for a in (0.5, 2.6):
        k.sphere(W, 0.16, (math.cos(a) * 0.8, 0.0 + math.sin(a) * 0.3, 1.2 + a * 0.2), "neon", scale=(1, 1, 1.6), segments=8, rings=5)


def prop_dead_tree(k):
    k.cyl(C["earth"], 1.2, 0.15, (0, 0, 0), verts=9)
    k.cyl(C["bark"], 0.32, 2.6, (0, 0, 0.15), verts=7, top=0.18, rot=(0.12, -0.08, 0))
    for (tilt, yaw, z, length) in ((0.9, 0.3, 1.8, 1.4), (-0.8, 1.4, 2.2, 1.3), (0.7, 2.8, 2.5, 1.0), (-0.6, 4.4, 2.6, 1.1), (0.2, 5.5, 2.7, 0.9)):
        k.cyl(C["bark"], 0.09, length, (0, 0, z), verts=5, top=0.02, rot=(0, tilt, yaw))
    for a in (0.3, 2.5, 4.4):
        k.sphere(W, 0.08, (math.cos(a) * 0.9, math.sin(a) * 0.9, 2.7), "glow", segments=6, rings=4)
    k.sphere(W, 0.28, (0.6, -0.5, 1.0), "neon", scale=(1, 1, 1.7), segments=10, rings=6)
    k.cone(W, 0.2, 0.5, (0.6, -0.5, 0.3), "neon", verts=6, rot=(math.pi, 0, 0))


def prop_ghost(k):
    k.sphere(W, 0.35, (0, 0, 1.3), "neon", scale=(1, 1, 1.25), segments=12, rings=8)
    k.cone(W, 0.36, 0.9, (0, 0, 0.35), "neon", verts=8, rot=(0, 0, 0))
    for ex in (-0.12, 0.12):
        k.sphere(C["black"], 0.06, (ex, -0.31, 1.4), segments=6, rings=4)


FACTORIES = {
    "ec2-crooked-cottage.glb": ec2_cottage,
    "ec2-victorian-house.glb": ec2_victorian,
    "ec2-gated-manor.glb": ec2_gated_manor,
    "ec2-dracula-castle.glb": ec2_dracula_castle,
    "rds-moon-crypt.glb": rds_crypt_tower,
    "dynamodb-cauldron-brewery.glb": dynamodb_cauldron_brewery,
    "s3-pumpkin-cellar.glb": s3_pumpkin_cellar,
    "lambda-wisp-lantern.glb": lambda_wisp_lantern,
    "containers-mausoleum-row.glb": containers_mausoleum_row,
    "lb-crossroads-gallows.glb": lb_crossroads_gallows,
    "igw-castle-gate.glb": igw_castle_gate,
    "nat-iron-gate.glb": nat_iron_gate,
    "sg-spiked-fence.glb": sg_spiked_fence,
    "iam-banner-standard.glb": iam_banner_standard,
    "kms-crypt-vault.glb": kms_crypt_vault,
    "edge-bell-tower.glb": edge_bell_tower,
    "messaging-raven-tree.glb": messaging_raven_tree,
    "monitoring-angel-statue.glb": monitoring_angel_statue,
    "generic-tombstone.glb": generic_tombstone,
    "subnet-graveyard.glb": subnet_graveyard,
    "signpost-crooked.glb": signpost_crooked,
    "candle-cluster.glb": candle_cluster,
    "lantern-post.glb": lantern_post,
    "coffin-row.glb": coffin_row,
    "vpc-wall-gate.glb": vpc_wall_gate,
    "region-gargoyle.glb": region_gargoyle,
    "az-lamp-shrine.glb": az_lamp_shrine,
    "prop-pumpkin-patch.glb": prop_pumpkin_patch,
    "prop-hearse.glb": prop_hearse,
    "prop-graveyard.glb": prop_graveyard,
    "prop-dead-tree.glb": prop_dead_tree,
    "prop-ghost.glb": prop_ghost,
}

LANDMARK = 0.42
SMALL = 0.38
MODELS = {
    "structure:region": ("region-gargoyle.glb", LANDMARK),
    "structure:az": ("az-lamp-shrine.glb", LANDMARK),
    "structure:vpc": ("vpc-wall-gate.glb", LANDMARK),
    "structure:subnet": ("subnet-graveyard.glb", LANDMARK),
    "family:compute": ("ec2-victorian-house.glb", LANDMARK),
    "family:containers": ("containers-mausoleum-row.glb", LANDMARK),
    "family:serverless": ("lambda-wisp-lantern.glb", LANDMARK),
    "family:database": ("rds-moon-crypt.glb", LANDMARK),
    "family:storage": ("s3-pumpkin-cellar.glb", LANDMARK),
    "family:gateway": ("igw-castle-gate.glb", LANDMARK),
    "family:loadbalancer": ("lb-crossroads-gallows.glb", LANDMARK),
    "family:edge": ("edge-bell-tower.glb", LANDMARK),
    "family:messaging": ("messaging-raven-tree.glb", LANDMARK),
    "family:security": ("kms-crypt-vault.glb", LANDMARK),
    "family:monitoring": ("monitoring-angel-statue.glb", LANDMARK),
    "family:generic": ("generic-tombstone.glb", LANDMARK),
    "aws_instance": ("ec2-victorian-house.glb", LANDMARK),
    "aws_instance.tiny": ("ec2-crooked-cottage.glb", LANDMARK),
    "aws_instance.small": ("ec2-victorian-house.glb", LANDMARK),
    "aws_instance.large": ("ec2-gated-manor.glb", LANDMARK),
    "aws_instance.huge": ("ec2-dracula-castle.glb", LANDMARK),
    "aws_s3_bucket": ("s3-pumpkin-cellar.glb", LANDMARK),
    "aws_db_instance": ("rds-moon-crypt.glb", LANDMARK),
    "aws_dynamodb_table": ("dynamodb-cauldron-brewery.glb", LANDMARK),
    "aws_lambda_function": ("lambda-wisp-lantern.glb", LANDMARK),
    "aws_lb": ("lb-crossroads-gallows.glb", LANDMARK),
    "aws_nat_gateway": ("nat-iron-gate.glb", LANDMARK),
    "aws_internet_gateway": ("igw-castle-gate.glb", LANDMARK),
    "aws_security_group": ("sg-spiked-fence.glb", LANDMARK),
    "aws_iam_role": ("iam-banner-standard.glb", LANDMARK),
    "aws_kms_key": ("kms-crypt-vault.glb", LANDMARK),
    "aws_sqs_queue": ("messaging-raven-tree.glb", LANDMARK),
    "aws_route53_zone": ("edge-bell-tower.glb", LANDMARK),
    "aws_vpc": ("vpc-wall-gate.glb", LANDMARK),
    "aws_subnet": ("subnet-graveyard.glb", LANDMARK),
    "aws_route_table": ("signpost-crooked.glb", SMALL),
    "aws_route_table_association": ("candle-cluster.glb", SMALL),
    "aws_lb_target_group_attachment": ("candle-cluster.glb", SMALL),
    "aws_db_subnet_group": ("candle-cluster.glb", SMALL),
    "aws_eip": ("lantern-post.glb", SMALL),
    "aws_lb_target_group": ("coffin-row.glb", SMALL),
}
PROPS = [
    {"file": "prop-hearse.glb", "placement": "road", "perDistrict": 1, "scale": 0.36},
    {"file": "prop-pumpkin-patch.glb", "placement": "sidewalk", "perDistrict": 2, "scale": 0.42},
    {"file": "prop-ghost.glb", "placement": "sidewalk", "perDistrict": 1, "scale": 0.4},
    {"file": "prop-graveyard.glb", "placement": "lot", "perDistrict": 1, "scale": 0.5},
    {"file": "prop-dead-tree.glb", "placement": "lot", "perDistrict": 1, "scale": 0.55},
]

kit = Kit(OUT, glow="#ff8a1f", neon="#3fe0cc", glow_strength=1.15, neon_strength=1.1)
info = {i["file"]: i for i in kit.build_all(FACTORIES)}

scene = {
    "background": "#141a3a", "ground": "#4f4a68", "earth": "#2c2640", "base": "#5b5f78", "roof": "#2f3d7d", "accent": "#ff8a2b", "glow": "#ffb454", "skyLight": "#7686e0", "groundLight": "#241d40", "keyLight": "#a9b9ff",
    "keyIntensity": 2.3, "fillIntensity": 1.05, "decor": "pine", "fog": 0.9,
}
library = {
    "version": 1,
    "id": WORLD,
    "name": "Haunted World",
    "referenceImages": ["docs/images/Haunted-Theme.jpeg"],
    "palette": {"sky": "#141a3a", "ground": "#4f4a68", "earth": "#2c2640", "base": "#5b5f78", "roof": "#2f3d7d", "accent": "#ff8a2b", "glow": "#ffb454"},
    "scene": scene,
    "streets": {
        "road": "#3a3748", "sidewalk": "#77788f", "lampPost": "#1f1e27", "lampGlow": "#ff9a3c", "lightPools": True,
    },
    "lighting": {"preset": "night"},
    "camera": {"elevation": 40, "yaw": 45, "minDistance": 7, "maxDistance": 140},
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
    print(f"{f:32s} {i['bytes']:>7d} B  tris {i['triangles']:>5d}  h {i['height']:>5.1f}  fp {i['footprint']:>4.1f}")
