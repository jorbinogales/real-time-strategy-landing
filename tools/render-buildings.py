"""Render the game's finished GLBs as transparent high-resolution website art."""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

GAME = Path('C:/dev/rts/assets/buildings')
OUT = Path('C:/dev/rts-landing/public/images/buildings')
RACES = {
    'humanos': ('human', {
        'ayuntamiento': 'ayuntamiento', 'cuartel': 'cuartel',
        'campo-de-arqueria': 'arqueria', 'granja': 'granja',
        'deposito-minerales': 'deposito-minerales', 'aserradero': 'aserradero',
        'molino': 'molino', 'casa': 'casa',
    }),
    'orcos': ('orc', {
        'salon-de-guerra': 'salon-de-guerra', 'matadero': 'matadero',
        'cuartel': 'cuartel', 'campo-de-jabalinas': 'campo-de-jabalinas',
    }),
    'elfos': ('elf', {
        'templo-sagrado': 'templo-sagrado', 'casa': 'cabana-guardabosques',
        'arboles-frutales': 'arboles-frutales', 'deposito-frutas': 'deposito-frutas',
        'deposito-minerales': 'deposito-minerales',
        'cabana-guardabosques': 'casa', 'cuartel': 'cuartel',
        'arqueria': 'arqueria',
    }),
    'enanos': ('dwarf', {
        'salon-de-gremio': 'salon-de-gremio', 'deposito': 'deposito',
        'ganaderia': 'ganaderia', 'cuartel': 'cuartel',
        'campo-de-lanzadores': 'campo-de-lanzadores',
    }),
}
PARTS = {
    ('humanos', 'aserradero'): [('aserradero_sierra.glb', (-0.12, 0.55, 0.35)),
                                ('aserradero_tronco.glb', (0.25, 0.45, 0.36))],
    ('humanos', 'molino'): [('molino_aspas.glb', (0, 1.68, 0.78))],
    ('elfos', 'templo-sagrado'): [('templo-sagrado_cristal.glb', (0, 1.92, -0.18))],
}

selected = set(sys.argv[sys.argv.index('--') + 1:]) if '--' in sys.argv else None

def import_glb(path):
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    return [o for o in bpy.context.scene.objects if o not in before]

def point_world(obj, corner):
    return obj.matrix_world @ Vector(corner)

for race, (source_dir, mapping) in RACES.items():
    for ident, model in mapping.items():
        if selected and f'{race}/{ident}' not in selected:
            continue
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)
        file = GAME/source_dir/f'{model}_e4.glb'
        if not file.exists():
            print('MISSING', file, flush=True)
            continue
        import_glb(file)
        for part_file, pos in PARTS.get((race, ident), []):
            objects = import_glb(GAME/source_dir/part_file)
            # glTF (X,Y,Z) maps to Blender (X,-Z,Y).
            for obj in objects:
                if obj.parent is None:
                    obj.location += Vector((pos[0], -pos[2], pos[1]))
        meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
        points = [point_world(o, corner) for o in meshes for corner in o.bound_box]
        low = Vector([min(p[i] for p in points) for i in range(3)])
        high = Vector([max(p[i] for p in points) for i in range(3)])
        center = (low+high)/2
        span = high-low
        size = max(span)

        cam_data = bpy.data.cameras.new('web_camera')
        cam = bpy.data.objects.new('web_camera', cam_data)
        bpy.context.collection.objects.link(cam)
        cam.location = center + Vector((size*1.25, -size*1.8, size*1.35))
        direction = center-cam.location
        cam.rotation_euler = direction.to_track_quat('-Z','Y').to_euler()
        cam_data.type = 'ORTHO'
        cam_data.ortho_scale = max(span.x*1.55, span.y*1.65, span.z*1.52)
        bpy.context.scene.camera = cam

        for name, offset, energy, scale in [
            ('key', (-1.2,-1.0,1.8), 900, 2.0),
            ('fill', (1.0,0.4,1.2), 350, 2.5),
        ]:
            data=bpy.data.lights.new(name,'AREA')
            light=bpy.data.objects.new(name,data)
            bpy.context.collection.objects.link(light)
            light.location=center+Vector((offset[0]*size,offset[1]*size,offset[2]*size))
            light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
            data.energy=energy
            data.shape='DISK'
            data.size=max(size*scale,2)

        scene=bpy.context.scene
        scene.render.engine='CYCLES'
        scene.cycles.samples=24
        scene.world.use_nodes=True
        bg=scene.world.node_tree.nodes.get('Background')
        bg.inputs['Color'].default_value=(0.82,0.87,0.95,1)
        bg.inputs['Strength'].default_value=0.7
        scene.render.film_transparent=True
        scene.render.resolution_x=1024
        scene.render.resolution_y=1024
        scene.render.resolution_percentage=100
        scene.render.image_settings.file_format='PNG'
        scene.render.image_settings.color_mode='RGBA'
        output=OUT/race/f'{ident}.png'
        output.parent.mkdir(parents=True,exist_ok=True)
        scene.render.filepath=str(output)
        bpy.ops.render.render(write_still=True)
        print('RENDERED', f'{race}/{ident}', output, flush=True)
