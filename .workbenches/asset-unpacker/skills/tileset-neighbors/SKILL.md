---
name: tileset-neighbors
description: Analyze a 2D grid tileset, assign conservative semantic tile roles and groups, generate allowed_neighbors.json, or validate directional neighbor constraints.
---

# Tileset neighbors

Read [the output contract](references/output-contract.md) before editing an
output file.

1. Inventory every source image and metadata file. Locate the full sheet and
individual tiles; read dimensions, tile size, padding, and grid dimensions from
source metadata when available.
2. Inspect the whole sheet first, then inspect candidate terrain families,
edges, corners, paths, walls, roofs, and multi-cell objects at native scale.
The sheet position is evidence of a family, not proof of an adjacency rule.
3. Make a small evidence table while classifying: source identifier, semantic
role, group tag if any, and observed required contacts. Do not assign a rule
when evidence is absent or ambiguous.
4. Add group rules for true interchangeable families. Add tile rules only for
required connections or exceptions. A missing direction means unrestricted,
not prohibited.
5. Check each explicit edge relation against its opposite direction, including
relations that target a group. Keep no duplicate targets and no references to
unlisted groups or tiles.
6. Validate JSON syntax with `jq empty allowed_neighbors.json`. Use a short
`python3` check to verify reference resolution, cardinal directions, duplicate
entries, and explicit opposite-direction reciprocity. Report any intentionally
unconstrained or uncertain family rather than fabricating an allow-list.
