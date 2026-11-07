import { config, nonTriangleSymbols } from "./config.js";

// Probabilities describe consecutive ranges in [0, 1). Items within a range
// share it equally. A custom roll may intentionally bias the distribution.
export async function selectFeature(category, context, rollSource = context.random) {
  const total = category.groups.reduce((sum, group) => sum + group.chance, 0);
  if (Math.abs(total - 1) > 1e-10 || category.groups.some(g => !Number.isFinite(g.chance) || g.chance < 0 || !g.items.length)) {
    throw new Error("Feature group probabilities must total 1 and groups must have items");
  }
  const roll = typeof rollSource === "function" ? await rollSource(context) : rollSource;
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new Error("Feature roll must be a number in [0, 1)");
  }
  let start = 0;
  for (const group of category.groups) {
    const end = start + group.chance;
    if (roll < end && group.chance > 0) {
      const index = Math.min(group.items.length - 1, Math.floor(((roll - start) / group.chance) * group.items.length));
      const item = group.items[index];
      return typeof item === "function" ? await item(context) : item;
    }
    start = end;
  }
  throw new Error("Feature roll did not match a group");
}

function gaussian(random) {
  return Math.sqrt(-2 * Math.log(Math.max(Number.EPSILON, random()))) * Math.cos(2 * Math.PI * random());
}
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const only = item => ({ groups: [{ chance: 1, items: [item] }] });

// Evaluated in order. Generated values can inspect earlier selections.
export const featureCatalogue = {
  pace: only(({ random }) => {
    let variation;
    do { variation = gaussian(random) * config.paceVariation; }
    while (Math.abs(variation) > config.maxPaceDeviation);
    return 1 + variation;
  }),
  shape: { groups: [
    { chance: config.subtleDotChance, items: [{ symbol: 8, subtleDot: true }] },
    { chance: (1 - config.subtleDotChance) * config.triangleChance, items: [6, 7] },
    { chance: (1 - config.subtleDotChance) * config.cardSuitChance, items: [9, 10, 11, 12] },
    { chance: (1 - config.subtleDotChance) * (1 - config.triangleChance - config.cardSuitChance), items: nonTriangleSymbols },
  ] },
  color: only(({ random, features }) => {
    const hue = Math.floor(random() * 360);
    const rareWhite = random() < config.rareWhiteChance;
    const saturation = clamp(config.symbolColor.saturation + gaussian(random) * config.symbolColor.saturationDeviation, config.symbolColor.saturationMin, config.symbolColor.saturationMax);
    const lightness = clamp(config.symbolColor.lightness + gaussian(random) * config.symbolColor.lightnessDeviation, config.symbolColor.lightnessMin, config.symbolColor.lightnessMax);
    const shape = features.shape;
    if (shape.subtleDot) return config.subtleDotColor;
    if (rareWhite) return config.white;
    if (shape.symbol >= 9) return shape.symbol === 10 || shape.symbol === 11 ? config.cardColors.red : config.cardColors.black;
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }),
  size: { groups: [
    { chance: config.symbolSizeChance, items: [config.symbolSizes[0]] },
    { chance: 1 - config.symbolSizeChance, items: [config.symbolSizes[1]] },
  ] },
  idle: { groups: [
    { chance: config.idleChance, items: [true] },
    { chance: 1 - config.idleChance, items: [false] },
  ] },
};

export async function selectFeatures(random, id, seed) {
  const features = {};
  const context = { random, id, seed, features };
  for (const [name, category] of Object.entries(featureCatalogue)) {
    const value = await selectFeature(category, context, category.roll ?? random);
    features[name] = name === "shape" && typeof value === "number" ? { symbol: value, subtleDot: false } : value;
  }
  return features;
}
