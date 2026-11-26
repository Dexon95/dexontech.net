/**
 * @typedef {{ kind: "square" | "circle" | "cross" | "plus" | "diamond" |
 *   "diamond-filled" | "triangle" | "triangle-filled" } |
 *   { kind: "dot", subtle?: boolean } |
 *   { kind: "suit", glyph: string, suitColor: "red" | "black" }} AgentShape
 */

/**
 * Pace scales the site’s step rate, and size is a fraction of one cell.
 * @typedef {{ pace: number, shape: AgentShape, color: string, size: number, idle: boolean }} AgentFeatures
 */

// Agent rarity is configured here. Triangle and suit odds apply to agents
// that didn't roll a subtle dot; ordinary shapes get the remaining chance.
const odds = {
  subtleDot: 0.1,
  triangleAmongOtherShapes: 1 / 3,
  suitAmongOtherShapes: 0.035,
  rareWhite: 0.01,
  largeSize: 0.5,
  largeCardSymbol: 0.1,
  idle: 0.01,
};
for (const [feature, chance] of Object.entries(odds)) {
  if (!Number.isFinite(chance) || chance < 0 || chance > 1) {
    throw new RangeError("Invalid agent catalogue chance for " + feature + ". Expected a value from 0 to 1.");
  }
}
if (odds.triangleAmongOtherShapes + odds.suitAmongOtherShapes > 1) {
  throw new RangeError("Triangle and suit chances in the agent catalogue must add up to at most 1.");
}

const paceVariation = 0.2;
const maxPaceDeviation = 0.5;
const symbolColor = {
  subtleDot: "#8a8f98",
  white: "#fff",
  suits: { red: "#ff5364", black: "#c7d0db" },
  saturation: 100,
  saturationDeviation: 20,
  saturationMin: 80,
  saturationMax: 100,
  lightness: 65,
  lightnessDeviation: 20,
  lightnessMin: 60,
  lightnessMax: 85,
};

// Probabilities describe consecutive ranges in [0, 1). Items within a range
// share it equally. A custom roll may intentionally bias the distribution.
export async function selectFeature(category, context, rollSource = context.random) {
  const groups = typeof category.groups === "function" ? category.groups(context) : category.groups;
  const total = groups.reduce((sum, group) => sum + group.chance, 0);
  const invalidGroup = groups.some(({ chance, items }) =>
    !Number.isFinite(chance) || chance < 0 || !items.length,
  );
  if (invalidGroup || Math.abs(total - 1) > 1e-10) {
    throw new Error("Feature group probabilities must total 1 and groups must have items");
  }

  const roll = typeof rollSource === "function" ? await rollSource(context) : rollSource;
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new Error("Feature roll must be a number in [0, 1)");
  }

  let start = 0;
  for (const { chance, items } of groups) {
    const end = start + chance;
    if (roll < end && chance > 0) {
      const fraction = (roll - start) / chance;
      const index = Math.min(items.length - 1, Math.floor(fraction * items.length));
      const item = items[index];
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
const only = (item) => ({ groups: [{ chance: 1, items: [item] }] });
const regularShapeChance = 1 - odds.subtleDot;

// Evaluation and item order affect seeded outcomes. Color and size use the selected shape.
export const featureCatalogue = {
  pace: only(({ random }) => {
    let variation;
    do {
      variation = gaussian(random) * paceVariation;
    } while (Math.abs(variation) > maxPaceDeviation);
    return 1 + variation;
  }),
  shape: { groups: [
    {
      chance: odds.subtleDot,
      items: [{ kind: "dot", subtle: true }],
    },
    {
      chance: regularShapeChance * odds.triangleAmongOtherShapes,
      items: [{ kind: "triangle" }, { kind: "triangle-filled" }],
    },
    {
      chance: regularShapeChance * odds.suitAmongOtherShapes,
      items: [
        { kind: "suit", glyph: "♠", suitColor: "black" },
        { kind: "suit", glyph: "♥", suitColor: "red" },
        { kind: "suit", glyph: "♦", suitColor: "red" },
        { kind: "suit", glyph: "♣", suitColor: "black" },
      ],
    },
    {
      chance: regularShapeChance * (1 - odds.triangleAmongOtherShapes - odds.suitAmongOtherShapes),
      items: [
        { kind: "square" },
        { kind: "circle" },
        { kind: "cross" },
        { kind: "plus" },
        { kind: "diamond" },
        { kind: "diamond-filled" },
        { kind: "dot" },
      ],
    },
  ] },
  color: only(({ random, features: { shape } }) => {
    const hue = Math.floor(random() * 360);
    const rareWhite = random() < odds.rareWhite;
    const saturation = clamp(
      symbolColor.saturation + gaussian(random) * symbolColor.saturationDeviation,
      symbolColor.saturationMin,
      symbolColor.saturationMax,
    );
    const lightness = clamp(
      symbolColor.lightness + gaussian(random) * symbolColor.lightnessDeviation,
      symbolColor.lightnessMin,
      symbolColor.lightnessMax,
    );

    if (shape.kind === "dot" && shape.subtle) return symbolColor.subtleDot;
    if (rareWhite) return symbolColor.white;
    if (shape.kind === "suit") return symbolColor.suits[shape.suitColor];
    return `hsl(${hue} ${saturation}% ${lightness}%)`;
  }),
  size: {
    groups: ({ features: { shape } }) => {
      const largeChance = shape.kind === "suit" ? odds.largeCardSymbol : odds.largeSize;
      return [
        { chance: largeChance, items: [0.72] },
        { chance: 1 - largeChance, items: [0.34] },
      ];
    },
  },
  idle: { groups: [
    { chance: odds.idle, items: [true] },
    { chance: 1 - odds.idle, items: [false] },
  ] },
};

/** @returns {Promise<AgentFeatures>} */
export async function selectFeatures(random, id, seed) {
  const features = {};
  const context = { random, id, seed, features };
  for (const [name, category] of Object.entries(featureCatalogue)) {
    features[name] = await selectFeature(category, context, category.roll ?? random);
  }
  return features;
}
