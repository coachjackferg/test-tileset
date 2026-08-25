# `allowed_neighbors.json` contract

```json
{
  "groups": {
    "grass": {
      "neighbors": {
        "north": ["#grass", "dirt_edge_south"]
      }
    }
  },
  "tiles": {
    "grass_flowers": {
      "tags": ["#grass"]
    },
    "tree_top": {
      "neighbors": {
        "south": ["tree_bottom"]
      }
    },
    "tree_bottom": {
      "neighbors": {
        "north": ["tree_top"]
      }
    }
  }
}
```

The root object contains `groups` and `tiles` objects. A group is referred to
as `#<name>`; a tile identifier has no `#`. A group must have at least one
member tile and a non-empty `neighbors` object. Use no group when it is only a
label and has no shared directional rule.

A group has a `neighbors` object. A tile has an optional `tags` array and
optional `neighbors` object. `tags` contains only declared group references.
Each `neighbors` object maps one or more of `north`, `east`, `south`, and
`west` to non-empty, duplicate-free arrays of tile IDs or group references.

To resolve a tile's direction, use its own direction if present. Otherwise,
union that direction from every group named in `tags`. If neither provides the
doorways unambiguous.

Every effective explicit relation must be reciprocal. If tile `a` permits tile
`b` to its east, `b` must effectively permit `a` to its west; use
`north`/`south` analogously. Expand group references to all tagged member tiles
when checking this condition. A one-sided relation is invalid even when the
opposite side would otherwise be unrestricted.

Do not emit empty `neighbors` objects or empty direction arrays. Omitted
directions deliberately mean unrestricted placement. Restrict all structural
tile sides using profile evidence; omission is reserved for genuinely free
placement, typically overlays and standalone props.
