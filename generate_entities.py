import xml.etree.ElementTree as ET
import os
import json
from collections import defaultdict

EDM = '{http://schemas.microsoft.com/ado/2009/11/edm}'

print("Parsing XML...")
tree = ET.parse(r'C:\Users\PC\Desktop\DevOPS\MCP metadata\metadata.xml')
schema = tree.getroot().find(f'.//{EDM}Schema')

# ── 1. Association map: assoc_name → target entity type (Role="End") ──────────
assoc_target = {}
for assoc in schema.findall(f'{EDM}Association'):
    name = assoc.get('Name')
    for end in assoc.findall(f'{EDM}End'):
        if end.get('Role') == 'End':
            assoc_target[name] = end.get('Type', '').replace('StandardODATA.', '')

# ── 2. Collect all entity types ───────────────────────────────────────────────
all_entities = {}
for et in schema.findall(f'{EDM}EntityType'):
    name = et.get('Name')
    props = [
        {'name': p.get('Name'), 'type': p.get('Type', ''), 'nullable': p.get('Nullable', 'true')}
        for p in et.findall(f'{EDM}Property')
    ]
    nav_props = []
    for np in et.findall(f'{EDM}NavigationProperty'):
        rel = np.get('Relationship', '').replace('StandardODATA.', '')
        target = assoc_target.get(rel, '')
        nav_props.append({'name': np.get('Name'), 'target': target})
    all_entities[name] = {'properties': props, 'nav_props': nav_props}

def is_base(name):
    return not any(name.endswith(s) for s in ['_RecordType', '_RowType', '_VirtualEntity'])

def get_category(name):
    return name.split('_')[0]

def strip_to_base(name):
    for sfx in ('_RecordType', '_RowType'):
        if name.endswith(sfx):
            return name[:-len(sfx)]
    return name

# ── 3. Base entities + inherit nav props from their RecordType variants ────────
base_entities = {n: d for n, d in all_entities.items() if is_base(n)}
for name, data in all_entities.items():
    base = strip_to_base(name)
    if base != name and base in base_entities:
        for np in data['nav_props']:
            if np not in base_entities[base]['nav_props']:
                base_entities[base]['nav_props'].append(np)

# ── 4. Resolve nav-prop targets to base entities ──────────────────────────────
for name, data in base_entities.items():
    resolved = []
    for np in data['nav_props']:
        t = np['target']
        t_base = strip_to_base(t)
        if t_base in base_entities and t_base != name:
            resolved.append({'name': np['name'], 'target': t_base})
    data['resolved_navs'] = resolved

# ── 5. Write MD files ─────────────────────────────────────────────────────────
out_dir = r'C:\Users\PC\Desktop\DevOPS\MCP metadata\Entities'
os.makedirs(out_dir, exist_ok=True)

for cat in set(get_category(n) for n in base_entities):
    os.makedirs(os.path.join(out_dir, cat), exist_ok=True)

for name, data in base_entities.items():
    cat = get_category(name)
    props = data['properties']
    navs = data['resolved_navs']
    unique_navs = {(np['target'], np['name']) for np in navs}

    lines = [
        '---',
        f'category: {cat}',
        f'properties: {len(props)}',
        f'relations: {len(unique_navs)}',
        '---',
        '',
        f'# {name}',
        '',
        f'**Category:** {cat}  ',
        f'**Properties:** {len(props)}  ',
        f'**Relations:** {len(unique_navs)}',
        '',
    ]

    if props:
        lines += ['## Properties', '', '| Name | Type | Nullable |', '|------|------|----------|']
        for p in props:
            t = p['type'].replace('Collection(StandardODATA.', '').replace(')', '').replace('StandardODATA.', '')
            lines.append(f"| {p['name']} | {t} | {p['nullable']} |")
        lines.append('')

    if unique_navs:
        lines += ['## Related Entities', '']
        for target, nav_name in sorted(unique_navs):
            lines.append(f'- [[{target}]] — {nav_name}')
        lines.append('')

    path = os.path.join(out_dir, cat, f'{name}.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

print(f"[OK] Created {len(base_entities)} MD files in Entities/")

# ── 6. Build canvas (entities as nodes, associations as edges) ─────────────────
print("Building canvas...")

# Group by category, layout side by side
cat_order = ['Document', 'Catalog', 'InformationRegister', 'AccumulationRegister',
             'DocumentJournal', 'ChartOfAccounts', 'ChartOfCalculationTypes',
             'ChartOfCharacteristicTypes', 'AccountingRegister']
cat_colors = {
    'Document': '1', 'Catalog': '4', 'InformationRegister': '5',
    'AccumulationRegister': '2', 'AccountingRegister': '2',
    'DocumentJournal': '3', 'ChartOfAccounts': '6',
    'ChartOfCalculationTypes': '6', 'ChartOfCharacteristicTypes': '6',
}

cats = defaultdict(list)
for name in sorted(base_entities.keys()):
    cats[get_category(name)].append(name)

NODE_W, NODE_H, GAP_X, GAP_Y = 200, 50, 20, 15
COLS = 8  # entities per row within a category group
GROUP_GAP = 100  # horizontal gap between category sections

nodes = []
entity_pos = {}  # name -> (cx, cy) centre
x_offset = 0

for cat in cat_order:
    if cat not in cats:
        continue
    ents = cats[cat]
    color = cat_colors.get(cat, '')
    rows = (len(ents) + COLS - 1) // COLS

    # Category label node (text card header)
    label_node = {
        'id': f'__cat_{cat}',
        'x': x_offset,
        'y': -NODE_H - GAP_Y - 10,
        'width': COLS * (NODE_W + GAP_X) - GAP_X,
        'height': NODE_H,
        'type': 'text',
        'text': f'## {cat}\n*{len(ents)} entities*',
        'color': color,
    }
    nodes.append(label_node)

    for i, name in enumerate(ents):
        col = i % COLS
        row = i // COLS
        x = x_offset + col * (NODE_W + GAP_X)
        y = row * (NODE_H + GAP_Y)
        cx = x + NODE_W // 2
        cy = y + NODE_H // 2
        entity_pos[name] = (cx, cy)
        short = name[len(cat)+1:] if name.startswith(cat + '_') else name
        nodes.append({
            'id': name,
            'x': x,
            'y': y,
            'width': NODE_W,
            'height': NODE_H,
            'type': 'text',
            'text': short,
            'color': color,
        })

    x_offset += COLS * (NODE_W + GAP_X) + GROUP_GAP

# Edges: only between base entities, deduplicated
seen_edges = set()
edges = []
for name, data in base_entities.items():
    for np in data['resolved_navs']:
        t = np['target']
        if t not in entity_pos:
            continue
        key = tuple(sorted([name, t]))
        if key in seen_edges:
            continue
        seen_edges.add(key)
        edges.append({
            'id': f'e_{name}_{t}'.replace(' ', '_'),
            'fromNode': name,
            'toNode': t,
        })

canvas = {'nodes': nodes, 'edges': edges}
canvas_path = r'C:\Users\PC\Desktop\DevOPS\MCP metadata\1C_Full_Schema.canvas'
with open(canvas_path, 'w', encoding='utf-8') as f:
    json.dump(canvas, f, ensure_ascii=False)

print(f"[OK] Canvas: {len(nodes)} nodes, {len(edges)} edges -> 1C_Full_Schema.canvas")
print("\nDone! Open Obsidian Graph View for the interactive vectoral graph.")
print("Or open 1C_Full_Schema.canvas for the full entity canvas.")
