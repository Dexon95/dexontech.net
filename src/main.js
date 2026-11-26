import { createBrowserSeed, createSeededRandom } from "./prng.js";
import { config } from "./config.js";
import { selectFeatures } from "./catalogue.js";
import { createCanvasGrid } from "./canvas-grid.js";

const stepInterval = 1000 / config.baseStepsPerSecond;
const lightDuration = stepInterval * config.lightDurationMultiplier;

function start() {
  let seed;
  let agents = [];
  const canvas = document.getElementById("sign-canvas");
  const grid = createCanvasGrid(canvas, config);
  const stats = document.getElementById("render-fps");
  const seedDisplay = document.getElementById("render-seed");
  let renderedAgentCount = config.maxAgentCount;
  let fpsSampleStart;
  let fpsSampleFrames = 0;
  let averageFps = config.targetFrameRate;

  function placeAgents() {
    const { columns, rows } = grid;
    agents = Array(config.maxAgentCount).fill(null);
    for (let id = 0; id < config.maxAgentCount; id++) {
      const random = createSeededRandom((seed + id) >>> 0);
      const x = Math.floor(random() * columns);
      const y = Math.floor(random() * rows);
      selectFeatures(random, id, seed).then((features) => {
        const now = performance.now();
        const { pace, shape, color, size, idle } = features;
        agents[id] = {
          random, x, y, fromX: x, fromY: y, pace, idle,
          moveStarted: now, moveDuration: lightDuration / pace,
          nextStep: idle ? Infinity : now + (random() * stepInterval) / pace,
          trail: [], directionX: 0, directionY: 0,
          signs: grid.addAgent({ shape, color, size }),
          pausedAt: null, pausedHeadAlpha: null,
        };
      }).catch((error) => console.error(`Failed to initialize snake ${id}:`, error));
    }
  }

  function stepAgent(agent, now) {
    const { columns: cols, rows: rowCount } = grid;
    // Draw regardless of boundaries, so an edge does not change future rolls.
    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const options = directions.filter(([dx, dy]) => dx !== -agent.directionX || dy !== -agent.directionY);
    const [dx, dy] = options[Math.floor(agent.random() * options.length)];
    agent.directionX = dx;
    agent.directionY = dy;
    agent.fromX = agent.x;
    agent.fromY = agent.y;
    const outside = agent.x < 0 || agent.x >= cols || agent.y < 0 || agent.y >= rowCount;
    const nextX = outside ? Math.max(0, Math.min(cols - 1, agent.x)) : agent.x + dx;
    const nextY = outside ? Math.max(0, Math.min(rowCount - 1, agent.y)) : agent.y + dy;
    if (outside || (nextX >= 0 && nextX < cols && nextY >= 0 && nextY < rowCount)) {
      if (nextX !== agent.x || nextY !== agent.y) {
        agent.trail.unshift([agent.x, agent.y]);
        agent.trail.length = Math.min(agent.trail.length, config.trailAlphas.length);
        agent.x = nextX;
        agent.y = nextY;
      }
    }
    if (agent.x === agent.fromX && agent.y === agent.fromY) {
      const elapsed = Math.max(0, now - agent.moveStarted) / (stepInterval / agent.pace);
      for (const cell of agent.trail) cell[2] = (cell[2] ?? 0) + elapsed;
    }
    agent.moveStarted = now;
    agent.moveDuration = lightDuration / agent.pace;
    agent.nextStep = now + stepInterval / agent.pace;
  }

  grid.resize(canvas.clientWidth, canvas.clientHeight);
  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    grid.resize(width, height);
  }).observe(canvas);

  seedDisplay.addEventListener("click", async () => {
    if (seed === undefined) return;
    const label = `Seed: ${seed}`;
    try {
      await navigator.clipboard.writeText(String(seed));
      seedDisplay.textContent = "Copied!";
    } catch {
      seedDisplay.textContent = "Copy failed";
    }
    window.setTimeout(() => {
      seedDisplay.textContent = label;
    }, 1500);
  });
  const urlSeed = new URLSearchParams(window.location.search).get("seed");
  const parsedSeed = urlSeed?.trim() ? Number(urlSeed) : NaN;
  const seedPromise =
    Number.isInteger(parsedSeed) &&
    parsedSeed >= 0 &&
    parsedSeed <= 0xffffffff
      ? Promise.resolve(parsedSeed)
      : createBrowserSeed();
  seedPromise.then((initialSeed) => {
    seed = initialSeed;
    seedDisplay.textContent = `Seed: ${seed}`;
    const url = new URL(window.location.href);
    url.searchParams.set("seed", seed);
    window.history.replaceState(null, "", url);
    placeAgents();
  });

  const frameInterval = 1000 / config.targetFrameRate;
  let nextFrameTime;
  let frameCount = 0;

  function draw(now) {
    requestAnimationFrame(draw);
    nextFrameTime ??= now;
    if (now + 1 < nextFrameTime) return;
    const intervals = Math.floor(Math.max(0, now - nextFrameTime) / frameInterval) + 1;
    nextFrameTime += frameInterval * intervals;
    frameCount++;
    grid.beginFrame();

    if (seed !== undefined) {
      fpsSampleFrames++;
      if (fpsSampleStart === undefined) fpsSampleStart = now;
      if (now - fpsSampleStart >= config.fpsSampleIntervalMs) {
        averageFps = (fpsSampleFrames * 1000) / (now - fpsSampleStart);
        fpsSampleFrames = 0;
        fpsSampleStart = now;
        if (averageFps <= config.pauseFrameRate) {
          renderedAgentCount = Math.max(1, Math.floor(renderedAgentCount * (1 - config.agentReductionRatio)));
        } else {
          renderedAgentCount = Math.min(config.maxAgentCount, renderedAgentCount + config.agentRecoveryPerSecond);
        }
      }
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        if (!agent) continue;
        const paused = i >= renderedAgentCount;
        if (paused && agent.pausedAt === null) {
          agent.pausedAt = now;
          const progress = Math.min(1, Math.max(0, (now - agent.moveStarted) / agent.moveDuration));
          const eased = progress * progress * (3 - 2 * progress);
          agent.pausedHeadAlpha = agent.idle || (agent.x === agent.fromX && agent.y === agent.fromY) ? config.headLightMaxAlpha : config.headLightStartAlpha + (config.headLightMaxAlpha - config.headLightStartAlpha) * eased;
        } else if (!paused && agent.pausedAt !== null) {
          const duration = now - agent.pausedAt;
          for (const cell of agent.trail) cell[2] = (cell[2] ?? 0) + duration / (stepInterval / agent.pace);
          agent.moveStarted += duration;
          agent.nextStep += duration;
          agent.pausedAt = null;
        }
        if (!paused && now >= agent.nextStep) stepAgent(agent, now);
        const trailProgress = Math.max(0, (now - agent.moveStarted) / (stepInterval / agent.pace));
        agent.trail.forEach(([x, y, extraAge = 0], age) => {
          const progress = age + extraAge + trailProgress;
          const index = Math.floor(progress);
          const fraction = progress - index;
          const eased = fraction * fraction * (3 - 2 * fraction);
          const start = config.trailAlphas[index] ?? 0;
          const end = config.trailAlphas[index + 1] ?? 0;
          agent.signs.drawTrail(x, y, start + (end - start) * eased);
        });
        const progress = Math.min(
          1,
          Math.max(0, (now - agent.moveStarted) / agent.moveDuration),
        );
        const eased = progress * progress * (3 - 2 * progress);
        {
          const alpha = paused ? agent.pausedHeadAlpha : agent.idle || (agent.x === agent.fromX && agent.y === agent.fromY)
            ? config.headLightMaxAlpha
            : config.headLightStartAlpha +
              (config.headLightMaxAlpha - config.headLightStartAlpha) * eased;
          agent.signs.drawHead(agent.x, agent.y, alpha);
        }
      }
    }
    if (frameCount % 4 === 0) {
      stats.textContent = `${Math.round(averageFps)} FPS avg · ${agents.filter(Boolean).length}`;
    }
  }

  requestAnimationFrame(draw);
}

start();
