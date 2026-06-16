import xml.etree.ElementTree as ET
import json
from collections import defaultdict, Counter

# Namespaces
NS = {
    'edmx': 'http://schemas.microsoft.com/ado/2007/06/edmx',
    'edm': 'http://schemas.microsoft.com/ado/2009/11/edm',
    'm': 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
}

def get_category(name):
    return name.split('_')[0]

def is_base_entity(name):
    return not any(name.endswith(s) for s in ['_RecordType', '_RowType', '_VirtualEntity'])

print("Parsing XML...")
tree = ET.parse(r'C:\Users\PC\Desktop\DevOPS\MCP metadata\metadata.xml')
root = tree.getroot()

schema = root.find('.//edm:Schema', NS)

# Collect entity types (base entities only)
entities = {}
for et in schema.findall('edm:EntityType', NS):
    name = et.get('Name')
    if is_base_entity(name):
        cat = get_category(name)
        entities[name] = cat

print(f"Found {len(entities)} base entity types")

# Collect associations: Association Name -> (End1 Type, End2 Type)
associations = {}
for assoc in schema.findall('edm:Association', NS):
    assoc_name = assoc.get('Name')
    ends = assoc.findall('edm:End', NS)
    if len(ends) >= 2:
        t1 = ends[0].get('Type', '').replace('StandardODATA.', '')
        t2 = ends[1].get('Type', '').replace('StandardODATA.', '')
        associations[assoc_name] = (t1, t2)

print(f"Found {len(associations)} associations")

# Build cross-category relationship matrix
cross_category = defaultdict(int)
cross_category_examples = defaultdict(set)

for assoc_name, (t1, t2) in associations.items():
    c1 = get_category(t1)
    c2 = get_category(t2)
    if c1 != c2:
        key = tuple(sorted([c1, c2]))
        cross_category[key] += 1
        cross_category_examples[key].add(f"{t1} -> {t2}")

print("\n=== Cross-Category Relationships ===")
for (c1, c2), count in sorted(cross_category.items(), key=lambda x: -x[1]):
    print(f"  {c1} <-> {c2}: {count} associations")

# Count entities per category
cat_counts = Counter(entities.values())
print("\n=== Entity Counts by Category ===")
for cat, count in cat_counts.most_common():
    print(f"  {cat}: {count}")

# Build entity name list per category
cat_entities = defaultdict(list)
for name, cat in entities.items():
    cat_entities[cat].append(name)

# Output structured data for graph generation
output = {
    "categories": dict(cat_counts),
    "cross_category_links": [
        {"source": c1, "target": c2, "count": count}
        for (c1, c2), count in cross_category.items()
    ],
    "entities_by_category": {k: sorted(v) for k, v in cat_entities.items()}
}

with open(r'C:\Users\PC\Desktop\DevOPS\MCP metadata\metadata_graph.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("\nSaved metadata_graph.json")
