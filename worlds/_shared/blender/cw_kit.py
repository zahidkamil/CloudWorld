"""CloudWorld shared Blender kit.

Every world build script (worlds/<id>/blender/build_library.py) uses this kit so new worlds are quick to make:

    exec(open(KIT).read())          # defines Kit
    kit = Kit(out_dir, glow="#ffd479", neon="#5eead4")
    kit.start()
    kit.box("#caa472", (4, 4, 6), (0, 0, 0))        # size (w, d, h), base position (x, y, z); Blender Z is up
    kit.export("ec2-walkup.glb")

Conventions (checked by scripts/validate-glb.mjs and the blender-model-review hook):
- Blender Z is up. The glTF exporter converts to +Y up, so models stand upright in three.js with no extra rotation.
- 1 unit = 1 metre. Pivot at the base centre (0, 0, 0). Footprint at most about 5.8 x 5.8.
- At most three materials per model: `paint` (vertex coloured, so one material carries every painted colour),
  `glow` (warm emissive: windows, lanterns) and `neon` (accent emissive: signs, ghost light).
  Meshes are joined per material, so each model costs at most three draw calls.
- Draco compression (the app self-hosts the decoder in public/draco/), no UVs, cameras, lights, animations,
  or external textures.
"""
import math
import os

import bpy

ROLES = ("paint", "glow", "neon")


def _rgba(hex_color):
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)) + (1.0,)


def _srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


class Kit:
    def __init__(self, out_dir, glow="#ffd479", neon="#5eead4", glow_strength=2.2, neon_strength=2.6):
        self.out_dir = out_dir
        os.makedirs(out_dir, exist_ok=True)
        self.collection = self._fresh_collection("CloudWorld_Build")
        self.materials = {
            "paint": self._paint_material(),
            "glow": self._emissive_material("glow", glow, glow_strength),
            "neon": self._emissive_material("neon", neon, neon_strength),
        }
        self.glow_hex = {"glow": glow, "neon": neon}
        self.exported = []

    # ---------- setup ----------
    def _fresh_collection(self, name):
        old = bpy.data.collections.get(name)
        if old:
            for obj in list(old.objects):
                bpy.data.objects.remove(obj, do_unlink=True)
            bpy.data.collections.remove(old)
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
        return col

    def _paint_material(self):
        m = bpy.data.materials.new("CW_paint")
        m.use_nodes = True
        nodes = m.node_tree.nodes
        bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
        bsdf.inputs["Roughness"].default_value = 0.78
        attr = nodes.new("ShaderNodeVertexColor")
        attr.layer_name = "Col"
        m.node_tree.links.new(attr.outputs["Color"], bsdf.inputs["Base Color"])
        return m

    def _emissive_material(self, name, hex_color, strength):
        m = bpy.data.materials.new(f"CW_{name}")
        m.use_nodes = True
        bsdf = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
        bsdf.inputs["Base Color"].default_value = _rgba(hex_color)
        bsdf.inputs["Emission Color"].default_value = _rgba(hex_color)
        bsdf.inputs["Emission Strength"].default_value = strength
        bsdf.inputs["Roughness"].default_value = 0.4
        m.diffuse_color = _rgba(hex_color)
        return m

    def start(self):
        for obj in list(self.collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)

    # ---------- primitives (Blender Z up; `at` is the base position) ----------
    def _finish(self, obj, color, role, rot=(0, 0, 0)):
        for c in list(obj.users_collection):
            c.objects.unlink(obj)
        self.collection.objects.link(obj)
        obj.rotation_euler = rot
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        mesh = obj.data
        hex_color = color if role == "paint" else self.glow_hex[role]
        r, g, b, a = _rgba(hex_color)
        attr = mesh.color_attributes.new(name="Col", type="BYTE_COLOR", domain="CORNER")
        lin = (_srgb_to_linear(r), _srgb_to_linear(g), _srgb_to_linear(b), a)
        for d in attr.data:
            d.color = lin
        mesh.materials.clear()
        mesh.materials.append(self.materials[role])
        obj["cw_role"] = role
        return obj

    def box(self, color, size, at, role="paint", rot=(0, 0, 0)):
        w, d, h = size
        x, y, z = at
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + h / 2))
        obj = bpy.context.object
        obj.scale = (w, d, h)
        return self._finish(obj, color, role, rot)

    def cyl(self, color, radius, height, at, role="paint", verts=16, top=None, rot=(0, 0, 0)):
        x, y, z = at
        if top is None:
            bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=height, location=(x, y, z + height / 2))
        else:
            bpy.ops.mesh.primitive_cone_add(
                vertices=verts, radius1=radius, radius2=top, depth=height, location=(x, y, z + height / 2)
            )
        return self._finish(bpy.context.object, color, role, rot)

    def cone(self, color, radius, height, at, role="paint", verts=4, rot=(0, 0, math.pi / 4)):
        x, y, z = at
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=radius, radius2=0, depth=height, location=(x, y, z + height / 2))
        return self._finish(bpy.context.object, color, role, rot)

    def sphere(self, color, radius, center, role="paint", scale=(1, 1, 1), segments=14, rings=8):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=center)
        obj = bpy.context.object
        obj.scale = scale
        return self._finish(obj, color, role)

    def dome(self, color, radius, at, role="paint", segments=20, height_scale=1.0, rot=(0, 0, 0)):
        """Hemisphere whose flat base sits at `at`."""
        x, y, z = at
        bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=10, radius=radius, location=(x, y, z))
        obj = bpy.context.object
        import bmesh

        bm = bmesh.new()
        bm.from_mesh(obj.data)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-4], context="VERTS")
        bm.to_mesh(obj.data)
        bm.free()
        obj.scale = (1, 1, height_scale)
        return self._finish(obj, color, role, rot)

    def torus(self, color, major, minor, center, role="paint", rot=(0, 0, 0), segments=24):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=major, minor_radius=minor, major_segments=segments, minor_segments=6, location=center
        )
        return self._finish(bpy.context.object, color, role, rot)

    def mesh(self, color, verts, faces, role="paint", rot=(0, 0, 0)):
        """Custom flat-shaded mesh from vertex and face lists (normals are recalculated outward)."""
        import bmesh

        me = bpy.data.meshes.new("cw_mesh")
        me.from_pydata(verts, [], faces)
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(me)
        bm.free()
        me.update()
        obj = bpy.data.objects.new("cw_mesh", me)
        self.collection.objects.link(obj)
        return self._finish(obj, color, role, rot)

    def prism(self, color, w, d, h, at, ridge="x", role="paint"):
        """Gable roof: a closed triangular prism, `w` x `d` footprint, ridge `h` above `at`, along X or Y."""
        x, y, z = at
        hw, hd = w / 2, d / 2
        if ridge == "x":
            v = [(x - hw, y - hd, z), (x + hw, y - hd, z), (x + hw, y + hd, z), (x - hw, y + hd, z), (x - hw, y, z + h), (x + hw, y, z + h)]
            f = [(0, 1, 2, 3), (0, 1, 5, 4), (2, 3, 4, 5), (0, 4, 3), (1, 2, 5)]
        else:
            v = [(x - hw, y - hd, z), (x + hw, y - hd, z), (x + hw, y + hd, z), (x - hw, y + hd, z), (x, y - hd, z + h), (x, y + hd, z + h)]
            f = [(0, 1, 2, 3), (0, 3, 5, 4), (1, 2, 5, 4), (0, 1, 4), (2, 3, 5)]
        return self.mesh(color, v, f, role)

    # ---------- composites ----------
    def window_bands(self, width, depth, z0, floors, floor_h, role="glow", inset=0.04, band=0.42, skip=()):
        """Emissive window strips around a box of `width` x `depth`, one per floor."""
        for i in range(floors):
            if i in skip:
                continue
            z = z0 + i * floor_h + floor_h * 0.3
            self.box("#ffffff", (width + inset, depth + inset, floor_h * band), (0, 0, z), role)

    def window_grid(self, width, depth, z0, floors, floor_h, cols, role="glow", pane=0.36, skip_every=0, sides="all"):
        """Individual lit windows: gives the brick and stone buildings their window rhythm."""
        for f in range(floors):
            z = z0 + f * floor_h + floor_h * 0.28
            for c in range(cols):
                if skip_every and (f * cols + c) % skip_every == 0:
                    continue
                t = (c + 0.5) / cols - 0.5
                if sides in ("all", "front"):
                    self.box("#ffffff", (width * pane / cols * 1.6, 0.06, floor_h * 0.45), (t * width, -depth / 2 - 0.02, z), role)
                if sides == "all":
                    self.box("#ffffff", (width * pane / cols * 1.6, 0.06, floor_h * 0.45), (t * width, depth / 2 + 0.02, z), role)
                    self.box("#ffffff", (0.06, depth * pane / cols * 1.6, floor_h * 0.45), (-width / 2 - 0.02, t * depth, z), role)
                    self.box("#ffffff", (0.06, depth * pane / cols * 1.6, floor_h * 0.45), (width / 2 + 0.02, t * depth, z), role)

    def awning(self, color, width, at, depth=0.7, rot_z=0.0):
        x, y, z = at
        return self.box(color, (width, depth, 0.12), (x, y, z), rot=(math.radians(12), 0, rot_z))

    # ---------- export ----------
    def export(self, filename):
        meshes = [o for o in self.collection.objects if o.type == "MESH"]
        if not meshes:
            raise RuntimeError("No meshes for " + filename)
        groups = {role: [o for o in meshes if o.get("cw_role") == role] for role in ROLES}
        for role in ROLES:
            group = groups[role]
            if len(group) > 1:
                bpy.ops.object.select_all(action="DESELECT")
                for o in group:
                    o.select_set(True)
                bpy.context.view_layer.objects.active = group[0]
                bpy.ops.object.join()
                group[0].name = "cw_" + role
            elif group:
                group[0].name = "cw_" + role
        meshes = [o for o in self.collection.objects if o.type == "MESH"]
        bbox_min = [1e9, 1e9, 1e9]
        bbox_max = [-1e9, -1e9, -1e9]
        tris = 0
        for o in meshes:
            for v in o.data.vertices:
                co = o.matrix_world @ v.co
                for i in range(3):
                    bbox_min[i] = min(bbox_min[i], co[i])
                    bbox_max[i] = max(bbox_max[i], co[i])
            o.data.calc_loop_triangles()
            tris += len(o.data.loop_triangles)
        bpy.ops.object.select_all(action="DESELECT")
        for o in meshes:
            o.select_set(True)
        bpy.context.view_layer.objects.active = meshes[0]
        path = os.path.join(self.out_dir, filename)
        bpy.ops.export_scene.gltf(
            filepath=path,
            export_format="GLB",
            use_selection=True,
            export_apply=True,
            export_yup=True,
            export_materials="EXPORT",
            export_vertex_color="MATERIAL",
            export_cameras=False,
            export_lights=False,
            export_animations=False,
            export_draco_mesh_compression_enable=True,
            export_draco_mesh_compression_level=6,
            export_texcoords=False,
        )
        info = {
            "file": filename,
            "bytes": os.path.getsize(path),
            "triangles": tris,
            "height": round(bbox_max[2], 2),
            "footprint": round(max(bbox_max[0] - bbox_min[0], bbox_max[1] - bbox_min[1]), 2),
            "meshes": len(meshes),
        }
        self.exported.append(info)
        return info

    def build_all(self, factories):
        """factories: {filename: callable(kit)}. Returns export info per file."""
        for filename, factory in factories.items():
            self.start()
            factory(self)
            self.export(filename)
        return self.exported
