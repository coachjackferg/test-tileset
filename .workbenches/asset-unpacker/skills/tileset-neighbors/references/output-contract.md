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
      "tags": ["#object"],
      "neighbors": {
        "south": ["tree_bottom"]
      }
    },
    "tree_bottom": {
      "tags": ["#object"],
      "neighbors": {
        "north": ["tree_top"]
      }
    }
  }
}
```

The root object contains `groups` and `tiles` objects. A group name is referred
to as `#<name>`; a tile identifier is referred to without `#`.

A group has an optional `neighbors` object. A tile has an optional `tags` array
and optional `neighbors` object. `tags` only contains references to declared
groups. A `neighbors` object maps one or more of `north`, `east`, `south`, and
`west` to non-empty arrays of tile IDs or group references.

An omitted `neighbors` object, or an omitted direction within it, means the
tile or group is unrestricted in that direction. An empty `neighbors` object
is equivalent but should not be emitted. An empty direction list is invalid:
it does not express an unrestricted edge and produces an unusable constraint.

Every explicit relation must be reciprocal. If `a.neighbors.east` contains
`b`, `b.neighbors.west` must contain `a`; use `north`/`south` analogously. For
group targets, check the relation for every tile carrying the target group tag.
If a target is deliberately exempt because the opposite direction is globally
unrestricted, do not emit the one-sided rule; unrestricted behavior cannot
encode a hard reciprocal guarantee.
