# 2D tileset neighbor analysis

Produce `allowed_neighbors.json` for grid-based 2D tilesets. It is a strict
cell-to-cell compatibility model for terrain, architecture, paths, and
multi-cell sprites. It must not become a loose catalogue of similarly named
assets.

Treat the supplied pack as the authority. Inspect the complete tilesheet before
individual tiles, and use supplied tile dimensions, padding, layout, maps, and
existing names as evidence. Use image crops or contact sheets when a sheet is
too small to inspect at native resolution. Do not infer a relation from naming
or palette similarity alone.

For every tile that participates in level construction, first record a four
side profile: the material or shape exposed at its north, east, south, and west
cell boundary. Mark each side as a continuation of a named surface, an exposed
edge into a named surface, a required object fragment, or unrestricted. Compare
opposing profiles to derive valid neighbors. The center art is secondary:
continuity at the shared boundary decides compatibility.

Classify tiles before writing rules. Structural tiles include terrain fills,
transitions, corners, paths, walls, roofs, and multi-cell fragments; they need
complete, evidence-backed directional coverage. Decorations, inventory icons,
and freely placeable overlays are non-structural and must not receive invented
constraints. State which families were classified as non-structural in the run
summary.

Use groups only when every tagged tile has the same four side profiles. A group
is a rule abstraction, not a taxonomy: never create an empty group merely to
label assets. Give a variant a tile-specific direction whenever it differs from
the group's profile. Preserve meaningful source names; only semantically rename
unnamed tiles when their role is visually clear.

Each explicit direction is a hard allow-list. Omit a direction only when it is
truly unrestricted; never use an empty list to mean unrestricted. A tile
inherits the union of its groups' rule for a direction only when the tile has no
rule for that direction. A tile-specific direction replaces inherited group
rules. Follow the output contract for the exact precedence and reciprocity
rules.

Before finishing, run the packaged validator against the generated JSON. It
checks syntax, references, group membership, effective-direction reciprocity,
and redundant empty objects. Resolve every validator failure. Then review each
structural family against its side profiles: fills must connect to all valid
fills and transitions; caps, corners, and junctions must expose only compatible
materials; and each multi-cell fragment must require its observed companion.
