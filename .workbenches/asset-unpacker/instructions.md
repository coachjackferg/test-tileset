# asset-unpacker

Your job is to observe a 2d asset pack and, from the tilemap and individual tiles, rename the tiles semantically if they are not already named so and generate an allowed_neighbors.json like the example below:
You may create groups for tile types that would have common connections, and individual tiles must be referenced by name. Tiles with no neighbors specified in a given direction will allow any tile in that direction.

```json
{
    "groups": {
        "grass": {
            "neighbors": {
                "north": ["#grass", "dirt_cap_south", "dirt_cap_south_west", "dirt_cap_south_east"],
                "east": ["#grass", "dirt_cap_west", "dirt_cap_south_west", "dirt_cap_north_west"],
                "south": ["#grass", "dirt_cap_north", "dirt_cap_north_west", "dirt_cap_north_east"],
                "west": ["#grass", "dirt_cap_east", "dirt_cap_south_east", "dirt_cap_north_east"]
            }
        }
    },
    "tiles": {
        "dirt": {
            "tags": [],
            "neighbors": {
                "north": ["dirt", "dirt_cap_north", "dirt_junction_north_and_east", "dirt_junction_north_and_west"],
                "east": ["dirt", "dirt_cap_east", "dirt_junction_north_and_east", "dirt_junction_south_and_east"],
                "south": ["dirt", "dirt_cap_south", "dirt_junction_south_and_east", "dirt_junction_south_and_west"],
                "west": ["dirt", "dirt_cap_west", "dirt_junction_south_and_west", "dirt_junction_north_and_west"]
            }
        },
        "dirt_cap_north": {
            "tags": [],
            "neighbors": {
                "north": ["#grass", "dirt_cap_south", "dirt_cap_south_east", "dirt_cap_south_west"],
                "east": ["dirt_cap_north", "dirt_cap_north_east", "dirt_junction_north_and_west"],
                "south": ["dirt", "dirt_cap_south", "dirt_junction_south_and_east", "dirt_junction_south_and_west"],
                "west": ["dirt_cap_north", "dirt_cap_north_west", "dirt_junction_north_and_east"]
            }
        },
        "dirt_cap_east": {
            "tags": [],
            "neighbors": {
                "north": ["dirt_cap_east", "dirt_cap_north_east", "dirt_junction_south_and_east"],
                "east": ["#grass", "dirt_cap_west", "dirt_cap_north_west", "dirt_cap_south_west"],
                "south": ["dirt_cap_east", "dirt_cap_south_east", "dirt_junction_north_and_east"],
                "west": ["dirt", "dirt_cap_west", "dirt_junction_north_and_west", "dirt_junction_south_and_west"]
            }
        },
        "dirt_cap_south": {
            "tags": [],
            "neighbors": {
                "north": ["dirt", "dirt_cap_north", "dirt_junction_north_and_east", "dirt_junction_north_and_west"],
                "east": ["dirt_cap_south", "dirt_cap_south_east", "dirt_junction_south_and_west"],
                "south": ["#grass", "dirt_cap_north", "dirt_cap_north_east", "dirt_cap_north_west"],
                "west": ["dirt_cap_south", "dirt_cap_south_west", "dirt_junction_south_and_east"]
            }
        },
        "dirt_cap_west": {
            "tags": [],
            "neighbors": {
                "north": ["dirt_cap_west", "dirt_cap_north_west", "dirt_junction_south_and_west"],
                "east": ["dirt", "dirt_cap_east", "dirt_junction_north_and_east", "dirt_junction_south_and_east"],
                "south": ["dirt_cap_west", "dirt_cap_south_west", "dirt_junction_north_and_west"],
                "west": ["#grass", "dirt_cap_east", "dirt_cap_north_east", "dirt_cap_south_east"]
            }
        },
        "dirt_cap_north_east": {
            "tags": [],
            "neighbors": {
                "north": ["#grass", "dirt_cap_south", "dirt_cap_south_east", "dirt_cap_south_west"],
                "east": ["#grass", "dirt_cap_west", "dirt_cap_north_west", "dirt_cap_south_west"],
                "south": ["dirt_cap_east", "dirt_cap_south_east", "dirt_junction_north_and_east"],
                "west": ["dirt_cap_north", "dirt_cap_north_west", "dirt_junction_north_and_east"]
            }
        },
        "dirt_cap_south_east": {
            "tags": [],
            "neighbors": {
                "north": ["dirt_cap_east", "dirt_cap_north_east", "dirt_junction_south_and_east"],
                "east": ["#grass", "dirt_cap_west", "dirt_cap_north_west", "dirt_cap_south_west"],
                "south": ["#grass", "dirt_cap_north", "dirt_cap_north_east", "dirt_cap_north_west"],
                "west": ["dirt_cap_south", "dirt_cap_south_west", "dirt_junction_south_and_east"]
            }
        },
        "dirt_cap_south_west": {
            "tags": [],
            "neighbors": {
                "north": ["dirt_cap_west", "dirt_cap_north_west", "dirt_junction_south_and_west"],
                "east": ["dirt_cap_south", "dirt_cap_south_east", "dirt_junction_south_and_west"],
                "south": ["#grass", "dirt_cap_north", "dirt_cap_north_east", "dirt_cap_north_west"],
                "west": ["#grass", "dirt_cap_east", "dirt_cap_north_east", "dirt_cap_south_east"]
            }
        },
        "dirt_cap_north_west": {
            "tags": [],
            "neighbors": {
                "north": ["#grass", "dirt_cap_south", "dirt_cap_south_east", "dirt_cap_south_west"],
                "east": ["dirt_cap_north", "dirt_cap_north_east", "dirt_junction_north_and_west"],
                "south": ["dirt_cap_west", "dirt_cap_south_west", "dirt_junction_north_and_west"],
                "west": ["#grass", "dirt_cap_east", "dirt_cap_north_east", "dirt_cap_south_east"]
            }
        },
        "dirt_junction_north_and_east": {
            "tags": [],
            "neighbors": {
                "north": ["dirt_cap_east", "dirt_cap_north_east", "dirt_junction_south_and_east"],
                "east": ["dirt_cap_north", "dirt_cap_north_east", "dirt_junction_north_and_west"],
                "south": ["dirt", "dirt_cap_south", "dirt_junction_south_and_east", "dirt_junction_south_and_west"],
                "west": ["dirt", "dirt_cap_west", "dirt_junction_south_and_west", "dirt_junction_north_and_west"]
            }
        },
        "dirt_junction_south_and_east": {
            "tags": [],
            "neighbors": {
                "north": ["dirt", "dirt_cap_north", "dirt_junction_north_and_east", "dirt_junction_north_and_west"],
                "east": ["dirt_cap_south", "dirt_cap_south_east", "dirt_junction_south_and_west"],
                "south": ["dirt_cap_east", "dirt_cap_south_east", "dirt_junction_north_and_east"],
                "west": ["dirt", "dirt_cap_west", "dirt_junction_south_and_west", "dirt_junction_north_and_west"]
            }
        },
        "dirt_junction_south_and_west": {
            "tags": [],
            "neighbors": {
                "north": ["dirt", "dirt_cap_north", "dirt_junction_north_and_east", "dirt_junction_north_and_west"],
                "east": ["dirt", "dirt_cap_east", "dirt_junction_north_and_east", "dirt_junction_south_and_east"],
                "south": ["dirt_cap_west", "dirt_cap_south_west", "dirt_junction_north_and_west"],
                "west": ["dirt_cap_south", "dirt_cap_south_west", "dirt_junction_south_and_east"]
            }
        },
        "dirt_junction_north_and_west": {
            "tags": [],
            "neighbors": {
                "north": ["dirt_cap_west", "dirt_cap_north_west", "dirt_junction_south_and_west"],
                "east": ["dirt", "dirt_cap_east", "dirt_junction_north_and_east", "dirt_junction_south_and_east"],
                "south": ["dirt", "dirt_cap_south", "dirt_junction_south_and_east", "dirt_junction_south_and_west"],
                "west": ["dirt_cap_north", "dirt_cap_north_west", "dirt_junction_north_and_east"]
            }
        },
        "grass": {
            "tags": ["#grass"]
        },
        "grass_with_flowers": {
            "tags": ["#grass"]
        },
        "grass_with_plants": {
            "tags": ["#grass"]
        },
        "grass_with_stones": {
            "tags": ["#grass"]
        }
    }
}
```