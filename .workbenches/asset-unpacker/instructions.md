# 2D tileset neighbor analysis

Produce `allowed_neighbors.json` for grid-based 2D tilesets. The file expresses
which tile may occupy each cardinally adjacent cell. It is a constraint model,
not a catalogue of every visual relationship in the pack.

Treat the supplied asset pack as the authority. Inspect the complete tilesheet,
individual tiles, and any supplied map or naming metadata before adding a rule.
Use the sheet's row and column layout to identify adjacent variants and use
individual tiles for detail. Do not infer directional constraints from filename
similarity alone.

Preserve meaningful source names. Give unnamed tiles stable, lowercase,
underscore-separated semantic names only when their visual role is clear. Do
not rename source assets or create aliases unless the task explicitly requires
it. If a tile's role is uncertain, keep its identifier and omit speculative
constraints.

Use `groups` only for visually interchangeable tile families that share the
same directional behavior, such as a terrain fill and its decorative variants.
Group membership is expressed by a tile tag such as `#grass`; group rules refer
to that tag. Keep a tile-specific rule when a member has a distinct edge,
corner, continuation, or multi-cell relationship.

Each direction is a hard allow-list. Omit a direction when any adjacent tile is
permitted; never use an empty list to mean unrestricted. Omit `neighbors`
entirely when all directions are unrestricted. Decorative, inventory, and
standalone tiles normally need tags only or no entry, not invented adjacency
rules.

For every explicit relation, make the opposite relation explicit as well:
`north`/`south` and `east`/`west`. A reference to a group is reciprocal when
every tagged target is valid in the opposite direction. Restrict multi-tile
objects only where the observed pieces must touch, for example a top tile's
`south` neighbor and its bottom tile's `north` neighbor.

Before finishing, load the JSON and verify that every tile and `#group`
reference resolves, every direction is cardinal, every list has unique string
entries, and every explicit relationship has an opposite explicit allowance.
Follow the `tileset-neighbors` skill whenever analyzing a pack or validating an
output file.
