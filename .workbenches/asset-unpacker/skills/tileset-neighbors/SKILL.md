---
name: tileset-neighbors
description: Analyze a grid-based 2D tileset, derive directional compatibility from exposed tile-edge profiles, create allowed_neighbors.json, or validate generated tile-neighbor rules.
---

# Tileset neighbors

Read [the output contract](references/output-contract.md) before editing an
output file.

1. Inventory source images and metadata. Establish tile dimensions, sheet grid,
padding, and whether a reference map shows actual placements. Build a scaled
contact sheet with `ffmpeg` when native sheet pixels are too small to inspect.
2. Split the pack into structural families and non-structural assets. Process
one structural family at a time: terrain fills and transitions, then paths,
walls and roofs, then multi-cell sprites. Do not use the physical order of
unrelated sheet rows as adjacency evidence.
3. For each structural tile, write a side profile before its JSON rule. For
each cardinal side, record its exposed material or required continuation. Test a
candidate against the opposing profile, not the filename. A terrain boundary
must face the appropriate other terrain; an internal continuation must face the
matching continuation; a top, bottom, left, or right sprite fragment must face
its observed companion.
4. Turn matching profiles into allow-lists. Include every observed compatible
variant, not only the most common one. Use a group only if all members have
identical profiles. If an asset has a distinct corner, endcap, door, window, or
fragment edge, express that exception on the tile itself.
5. Apply the contract's inheritance rule. Review all four directions for every
structural tile, then separately list the deliberately unrestricted
non-structural families in the final report. Do not silently leave a structural
side unconstrained because it was difficult to classify.
6. Run `python3 skills/tileset-neighbors/scripts/validate_neighbors.py
allowed_neighbors.json` and `jq empty allowed_neighbors.json`. Fix all reported
issues, then inspect a representative fill, edge, corner, junction, and
multi-cell object to confirm the rules are visually supported.
