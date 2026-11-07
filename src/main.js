import p5 from "p5";
import { createBrowserSeed, createSeededRandom } from "./prng.js";
import { config } from "./config.js";
import { selectFeatures } from "./catalogue.js";

const stepInterval = 1000 / config.baseStepsPerSecond;
const lightDuration = stepInterval * config.lightDurationMultiplier;

new p5((sketch) => {
  let seed;
  let agents = [];
  const symbolSprites = new Map();
  let stats;
  let seedDisplay;
  let renderedAgentCount = config.maxAgentCount;
  let fpsSampleStart;
  let fpsSampleFrames = 0;
  let averageFps = config.targetFrameRate;

  const columns = () => Math.max(1, Math.floor(sketch.width / config.cellSize));
  const rows = () => Math.max(1, Math.floor(sketch.height / config.cellSize));

  function placeAgents() {
    agents = Array(config.maxAgentCount).fill(null);
    for (let id = 0; id < config.maxAgentCount; id++) {
      const random = createSeededRandom((seed + id) >>> 0);
      const x = Math.floor(random() * columns());
      const y = Math.floor(random() * rows());
      selectFeatures(random, id, seed).then((features) => {
        const now = sketch.millis();
        const { pace, shape, color, size, idle } = features;
        agents[id] = {
          id, random, x, y, fromX: x, fromY: y, color,
          symbol: shape.symbol, subtleDot: shape.subtleDot, size, pace, idle,
          moveStarted: now, moveDuration: lightDuration / pace,
          nextStep: idle ? Infinity : now + (random() * stepInterval) / pace,
          trail: [], directionX: 0, directionY: 0, sprites: {},
          pausedAt: null, pausedHeadAlpha: null,
        };
      }).catch((error) => console.error(`Failed to initialize snake ${id}:`, error));
    }
  }

  function stepAgent(agent, now) {
    const cols = columns();
    const rowCount = rows();
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

  function renderSymbol(ctx, agent, x, y, alpha, size = 0.62, glow = false) {
    const centerX = (x + 0.5) * config.cellSize;
    const centerY = (y + 0.5) * config.cellSize;
    const radius = (config.cellSize * size) / 2;
    const glowScale = agent.subtleDot ? 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = agent.color;
    ctx.fillStyle = agent.color;
    ctx.lineWidth = Math.max(2, config.cellSize * 0.09);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (glow) {
      const auraRadius = config.cellSize * config.auraRadiusCells;
      const glowConfig = glow === "trail" ? config.trailGlow : config.headGlow;
      const drawAura = (radius, strength) => {
        const aura = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          radius,
        );
        aura.addColorStop(0, agent.color);
        aura.addColorStop(1, "transparent");
        ctx.globalAlpha = alpha * strength * glowScale;
        ctx.fillStyle = aura;
        ctx.fillRect(
          centerX - radius,
          centerY - radius,
          radius * 2,
          radius * 2,
        );
      };
      ctx.globalCompositeOperation = "screen";
      drawAura(auraRadius, glowConfig.outerAlpha);
      drawAura(auraRadius * 0.4, glowConfig.alpha);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = agent.color;
    }
    ctx.beginPath();
    if (agent.symbol >= 9) {
      ctx.font = `${Math.round(radius * 1.8)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = alpha;
      ctx.fillText(config.cardSuits[agent.symbol - 9], centerX, centerY);
      ctx.restore();
      return;
    }
    if (agent.symbol === 0) {
      ctx.rect(
        centerX - radius * 0.75,
        centerY - radius * 0.75,
        radius * 1.5,
        radius * 1.5,
      );
    } else if (agent.symbol === 1) {
      ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
    } else if (agent.symbol === 2) {
      ctx.moveTo(centerX - radius, centerY - radius);
      ctx.lineTo(centerX + radius, centerY + radius);
      ctx.moveTo(centerX - radius, centerY + radius);
      ctx.lineTo(centerX + radius, centerY - radius);
    } else if (agent.symbol === 3) {
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
    } else if (agent.symbol === 4 || agent.symbol === 5) {
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX + radius, centerY);
      ctx.lineTo(centerX, centerY + radius);
      ctx.lineTo(centerX - radius, centerY);
      ctx.closePath();
    } else if (agent.symbol === 6 || agent.symbol === 7) {
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX + radius, centerY + radius);
      ctx.lineTo(centerX - radius, centerY + radius);
      ctx.closePath();
    } else {
      ctx.arc(
        centerX,
        centerY,
        Math.max(1, radius * (agent.subtleDot ? 0.4 : 0.13)),
        0,
        Math.PI * 2,
      );
    }
    const filled =
      agent.symbol === 5 || agent.symbol === 7 || agent.symbol === 8;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = Math.max(2, config.cellSize * 0.09);
    if (filled) ctx.fill();
    else ctx.stroke();
    ctx.restore();
  }

  function drawSymbol(agent, x, y, alpha, size = 0.62, glow = false) {
    const spriteType = glow || "plain";
    let sprite = agent.sprites[spriteType];
    if (!sprite) {
      const key = JSON.stringify([
        agent.color,
        agent.symbol,
        agent.subtleDot,
        size,
        glow,
      ]);
      sprite = symbolSprites.get(key);
      if (!sprite) {
        const padding = config.cellSize;
        sprite = document.createElement("canvas");
        sprite.width = sprite.height = config.cellSize + padding * 2;
        renderSymbol(
          sprite.getContext("2d"),
          agent,
          1,
          1,
          1,
          size,
          glow,
        );
        symbolSprites.set(key, sprite);
      }
      agent.sprites[spriteType] = sprite;
    }
    const offset = config.cellSize;
    const ctx = sketch.drawingContext;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      sprite,
      x * config.cellSize - offset,
      y * config.cellSize - offset,
    );
    ctx.restore();
  }

  sketch.setup = () => {
    const container = document.getElementById("canvas");
    sketch
      .createCanvas(container.clientWidth, container.clientHeight)
      .parent(container.querySelector(".crt-content"));
    sketch.pixelDensity(1);
    sketch.frameRate(config.targetFrameRate);
    stats = document.getElementById("render-fps");
    seedDisplay = document.getElementById("render-seed");
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

    new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const size = [Math.round(width), Math.round(height)];
      if (
        size[0] > 0 &&
        size[1] > 0 &&
        (size[0] !== sketch.width || size[1] !== sketch.height)
      ) {
        sketch.resizeCanvas(...size);
      }
    }).observe(container);
  };

  sketch.draw = () => {
    sketch.background(...config.background);
    if (seed !== undefined) {
      const now = sketch.millis();
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
          if (start > 0) drawSymbol(agent, x, y, start + (end - start) * eased, agent.size, "trail");
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
          drawSymbol(agent, agent.x, agent.y, alpha, agent.size, true);
        }
      }
    }
    if (sketch.frameCount % 4 === 0) {
      stats.textContent = `${Math.round(averageFps)} FPS avg · ${agents.filter(Boolean).length}`;
    }
  };
});
