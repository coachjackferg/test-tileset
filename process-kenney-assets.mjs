import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const outputRoot = join(root, "processed_kenney");
const farmCommit = "37c05fc";
const townCommit = "a5df005";

function gitFile(commit, path, encoding) {
  return execFileSync("git", ["show", `${commit}:${path}`], {
    cwd: root,
    encoding,
    maxBuffer: 10 * 1024 * 1024,
  });
}

function gitJson(commit, path) {
  return JSON.parse(gitFile(commit, path, "utf8"));
}

function hash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function tileId(index) {
  return `tile_${String(index).padStart(4, "0")}`;
}

function validateModel(model, names) {
  const directions = new Set(["north", "east", "south", "west"]);
  const opposite = { north: "south", east: "west", south: "north", west: "east" };
  const nameSet = new Set(names);
  const members = new Map(Object.keys(model.groups).map((group) => [group, new Set()]));

  if (nameSet.size !== names.length) throw new Error("Duplicate semantic tile name");
  for (const [name, tile] of Object.entries(model.tiles)) {
    for (const tag of tile.tags ?? []) {
      if (!tag.startsWith("#") || !members.has(tag.slice(1))) {
        throw new Error(`${name} has unresolved tag ${tag}`);
      }
      members.get(tag.slice(1)).add(name);
    }
  }

  function validateNeighbors(owner, neighbors) {
    for (const [direction, targets] of Object.entries(neighbors ?? {})) {
      if (!directions.has(direction)) throw new Error(`${owner} uses invalid direction ${direction}`);
      if (!Array.isArray(targets) || !targets.length) throw new Error(`${owner}.${direction} is empty`);
      if (new Set(targets).size !== targets.length) throw new Error(`${owner}.${direction} has duplicates`);
      for (const target of targets) {
        const resolved = target.startsWith("#") ? members.has(target.slice(1)) : nameSet.has(target);
        if (!resolved) throw new Error(`${owner}.${direction} has unresolved target ${target}`);
      }
    }
  }

  for (const [group, value] of Object.entries(model.groups)) validateNeighbors(`#${group}`, value.neighbors);
  for (const [name, value] of Object.entries(model.tiles)) validateNeighbors(name, value.neighbors);

  function effective(tileName, direction) {
    const tile = model.tiles[tileName];
    const targets = [
      ...(tile.neighbors?.[direction] ?? []),
      ...(tile.tags ?? []).flatMap((tag) => model.groups[tag.slice(1)].neighbors?.[direction] ?? []),
    ];
    if (!targets.length) return null;
    return new Set(targets.flatMap((target) => {
      if (!target.startsWith("#")) return [target];
      return [...members.get(target.slice(1))];
    }));
  }

  for (const name of names) {
    for (const direction of directions) {
      const targets = effective(name, direction);
      if (!targets) continue;
      for (const target of targets) {
        if (!effective(target, opposite[direction])?.has(name)) {
          throw new Error(`${name}.${direction} -> ${target} is not reciprocal`);
        }
      }
    }
  }
}

function historicalPngNames(commit) {
  return execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", commit, "processed"],
    { cwd: root, encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter((path) => path.endsWith(".png"))
    .map((path) => basename(path, ".png"));
}

function writePack({ packName, commit, names, assetNames = names, sourceNames, model }) {
  const output = join(outputRoot, packName);
  mkdirSync(output, { recursive: true });
  validateModel(model, names);

  const tiles = {};
  for (let index = 0; index < names.length; index += 1) {
    const name = names[index];
    const filename = `${name}.png`;
    const image = gitFile(commit, `processed/${assetNames[index]}.png`);
    if (image.readUInt32BE(16) !== 16 || image.readUInt32BE(20) !== 16) {
      throw new Error(`${filename} is not a 16x16 PNG`);
    }
    writeFileSync(join(output, filename), image);
    tiles[sourceNames[index]] = filename;
  }

  const sourcePack = packName === "tiny-farm" ? "kenney_tiny-farm" : "kenney_tiny-town";
  copyFileSync(join(root, sourcePack, "License.txt"), join(output, "License.txt"));
  writeJson(join(output, "manifest.json"), {
    source_pack: sourcePack,
    tile_size: [16, 16],
    columns: 12,
    rows: 11,
    tiles,
  });
  writeJson(join(output, "allowed_neighbors.json"), model);
}

function farmModel(history, names, assetNames) {
  const renamed = new Map(assetNames.map((assetName, index) => [assetName, names[index]]));
  const tiles = {};
  for (let index = 0; index < names.length; index += 1) {
    const name = names[index];
    const sourceNeighbors = history.tiles[assetNames[index]]?.neighbors;
    const neighbors = sourceNeighbors && Object.fromEntries(
      Object.entries(sourceNeighbors).map(([direction, targets]) => [
        direction,
        targets.map((target) => renamed.get(target) ?? target),
      ]),
    );
    tiles[name] = neighbors && Object.keys(neighbors).length ? { neighbors } : {};
  }
  return { groups: {}, tiles };
}

function townModel(history, names) {
  const nameSet = new Set(names);
  const grass = new Set([
    "grass",
    "grass_with_plants",
    "grass_with_flowers",
    "grass_with_stones",
  ]);
  const tiles = {};

  for (const name of names) {
    const source = history.tiles[name] ?? {};
    const tile = {};
    if (grass.has(name)) tile.tags = ["#grass"];
    if (source.neighbors) {
      const neighbors = {};
      for (const [direction, targets] of Object.entries(source.neighbors)) {
        const valid = targets.filter((target) => target === "#grass" || nameSet.has(target));
        if (valid.length) neighbors[direction] = valid;
      }
      if (Object.keys(neighbors).length) tile.neighbors = neighbors;
    }
    tiles[name] = tile;
  }

  // A repeated chain segment must explicitly accept the segment above it.
  tiles.hanging_chain.neighbors.north = ["hanging_chain"];

  return {
    groups: { grass: history.groups.grass },
    tiles,
  };
}

const farmHistory = gitJson(farmCommit, "processed/allowed_neighbors.json");
const farmAssetNames = Object.keys(farmHistory.tiles);
if (farmAssetNames.length !== 132) throw new Error(`Expected 132 farm tiles, found ${farmAssetNames.length}`);
const farmSourceDirectory = join(root, "kenney_tiny-farm", "Tiles");
const farmSourceByHash = new Map(
  readdirSync(farmSourceDirectory)
    .filter((filename) => filename.endsWith(".png"))
    .map((filename) => [hash(readFileSync(join(farmSourceDirectory, filename))), basename(filename, ".png")]),
);
const farmSourceNames = [];
const farmNames = farmAssetNames.map((assetName, index) => {
  const sourceName = farmSourceByHash.get(hash(gitFile(farmCommit, `processed/${assetName}.png`)));
  farmSourceNames.push(sourceName ?? tileId(index));
  return sourceName && !sourceName.startsWith("tile_") ? sourceName : assetName;
});

const townHistory = gitJson(townCommit, "processed/allowed_neighbors.json");
const historicalNames = historicalPngNames(townCommit);
const nameByHash = new Map(
  historicalNames.map((name) => [hash(gitFile(townCommit, `processed/${name}.png`)), name]),
);
const townSourceDirectory = join(root, "kenney_tiny-town", "Tiles");
const townSourceNames = readdirSync(townSourceDirectory)
  .filter((name) => name.endsWith(".png"))
  .sort()
  .map((name) => basename(name, ".png"));
const townNames = townSourceNames.map((sourceName) => {
  const source = join(townSourceDirectory, `${sourceName}.png`);
  return nameByHash.get(hash(readFileSync(source)));
});

if (townNames.length !== 132 || townNames.some((name) => !name)) {
  throw new Error("Could not map all 132 town source tiles to semantic names");
}

mkdirSync(outputRoot, { recursive: true });
writePack({
  packName: "tiny-farm",
  commit: farmCommit,
  names: farmNames,
  assetNames: farmAssetNames,
  sourceNames: farmSourceNames,
  model: farmModel(farmHistory, farmNames, farmAssetNames),
});
writePack({
  packName: "tiny-town",
  commit: townCommit,
  names: townNames,
  sourceNames: townSourceNames,
  model: townModel(townHistory, townNames),
});

console.log(`Processed ${farmNames.length + townNames.length} tiles into ${outputRoot}`);
