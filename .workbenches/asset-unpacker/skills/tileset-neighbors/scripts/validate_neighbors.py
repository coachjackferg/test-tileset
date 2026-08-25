#!/usr/bin/env python3
"""Validate the portable allowed_neighbors.json contract."""

import json
import sys
from pathlib import Path


DIRECTIONS = {"north": "south", "east": "west", "south": "north", "west": "east"}


def fail(errors, message):
    errors.append(message)


def main(path):
    try:
        data = json.loads(Path(path).read_text())
    except (OSError, json.JSONDecodeError) as error:
        print(f"invalid JSON: {error}", file=sys.stderr)
        return 1

    errors = []
    if not isinstance(data, dict):
        fail(errors, "root must be an object")
        groups = {}
        tiles = {}
    else:
        groups = data.get("groups", {})
        tiles = data.get("tiles", {})
        if not isinstance(groups, dict) or not isinstance(tiles, dict):
            fail(errors, "groups and tiles must be objects")
            groups = groups if isinstance(groups, dict) else {}
            tiles = tiles if isinstance(tiles, dict) else {}

    members = {name: set() for name in groups}
    for tile, value in tiles.items():
        if not isinstance(value, dict):
            fail(errors, f"tile {tile!r} must be an object")
            continue
        tags = value.get("tags", [])
        if not isinstance(tags, list) or any(not isinstance(tag, str) for tag in tags):
            fail(errors, f"tile {tile!r} tags must be a string array")
            continue
        if len(tags) != len(set(tags)):
            fail(errors, f"tile {tile!r} has duplicate tags")
        for tag in tags:
            if not tag.startswith("#") or tag[1:] not in groups:
                fail(errors, f"tile {tile!r} references unknown group {tag!r}")
            else:
                members[tag[1:]].add(tile)

    def check_neighbors(owner, value, require_nonempty=False):
        neighbors = value.get("neighbors") if isinstance(value, dict) else None
        if neighbors == {}:
            fail(errors, f"{owner} has a redundant empty neighbors object")
        if require_nonempty and not isinstance(neighbors, dict):
            fail(errors, f"{owner} must define non-empty neighbors")
        if neighbors is None:
            return
        if not isinstance(neighbors, dict):
            fail(errors, f"{owner} neighbors must be an object")
            return
        for direction, targets in neighbors.items():
            if direction not in DIRECTIONS:
                fail(errors, f"{owner} has invalid direction {direction!r}")
            if not isinstance(targets, list) or not targets:
                fail(errors, f"{owner}.{direction} must be a non-empty array")
                continue
            if any(not isinstance(target, str) for target in targets):
                fail(errors, f"{owner}.{direction} contains a non-string target")
            if len(targets) != len(set(targets)):
                fail(errors, f"{owner}.{direction} contains duplicate targets")
            for target in targets:
                known = target[1:] in groups if target.startswith("#") else target in tiles
                if not known:
                    fail(errors, f"{owner}.{direction} references unknown target {target!r}")

    for group, value in groups.items():
        if not isinstance(value, dict):
            fail(errors, f"group {group!r} must be an object")
            continue
        if not members[group]:
            fail(errors, f"group {group!r} has no tagged tile members")
        check_neighbors(f"group {group!r}", value, require_nonempty=True)
    for tile, value in tiles.items():
        check_neighbors(f"tile {tile!r}", value)

    def expand(target):
        return members.get(target[1:], set()) if target.startswith("#") else {target}

    def effective(tile, direction):
        value = tiles[tile]
        own = value.get("neighbors", {})
        if isinstance(own, dict) and direction in own:
            return own[direction]
        inherited = []
        for tag in value.get("tags", []):
            group_rules = groups.get(tag[1:], {}).get("neighbors", {}) if tag.startswith("#") else {}
            if isinstance(group_rules, dict):
                inherited.extend(group_rules.get(direction, []))
        return inherited or None

    for source in tiles:
        for direction, opposite in DIRECTIONS.items():
            targets = effective(source, direction)
            if not targets:
                continue
            for target_ref in targets:
                for target in expand(target_ref):
                    if target not in tiles:
                        continue
                    reverse = effective(target, opposite)
                    if not reverse or not any(source in expand(candidate) for candidate in reverse):
                        fail(errors, f"{source}.{direction} permits {target}, but {target}.{opposite} does not permit {source}")

    if errors:
        print("allowed_neighbors.json failed validation:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("allowed_neighbors.json is valid")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: validate_neighbors.py allowed_neighbors.json", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
