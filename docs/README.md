# docs/ — 1C metadata tooling

Scripts and source files used to **generate** reference data for the MCP server. Not loaded at runtime.

| File | Purpose |
|------|---------|
| `metadata.xml` | Raw 1C OData metadata export |
| `metadata_graph.json` | Parsed metadata graph |
| `parse_metadata.py` | XML → JSON graph |
| `generate_entities.py` | XML → entity markdown files |
| `Chart of accounts KZ.json` | Source chart data |

## Entity schema files

The **889 entity `.md` files** live in one place only:

```
MCP 1C v1/Entities/
```

That folder is what the MCP server reads (`ENTITIES_DIR`). Do not duplicate it here.

When regenerating entities from metadata, output directly to `MCP 1C v1/Entities/`.
