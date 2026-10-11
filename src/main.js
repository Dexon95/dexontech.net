import p5 from "p5";
import { createBrowserSeed, createSeededRandom } from "./prng.js";
import { config, nonTriangleSymbols } from "./config.js";

const stepInterval = 1000 / config.baseStepsPerSecond;
const lightDuration = stepInterval * config.lightDurationMultiplier;

new p5((sketch) => {
  let seed;
  let agents = [];
  let fadingTrails = [];
  let stats;
  let seedDisplay;
  let renderedAgentCount = config.maxAgentCount;
  let fpsSampleStart;
  let fpsSampleFrames = 0;
  let averageFps = config.targetFrameRate;

  const columns = () => Math.max(1, Math.floor(sketch.width / config.cellSize));
  const rows = () => Math.max(1, Math.floor(sketch.height / config.cellSize));

  function randomPaceRatio(random) {
    let ratio;
    do {
      const normal = Math.sqrt(-2 * Math.log(Math.max(Number.EPSILON, random()))) * Math.cos(2 * Math.PI * random());
      ratio = normal * config.paceVariation;
    } while (Math.abs(ratio) > config.maxPaceDeviation);
    return ratio;
  }

  function placeAgents() {
    const cols = columns();
    const rowCount = rows();
    agents = Array.from({ length: Math.min(config.maxAgentCount, cols * rowCount) }, (_, id) => {
      const random = createSeededRandom((seed + id) >>> 0);
      const x = Math.floor(random() * cols);
      const y = Math.floor(random() * rowCount);
      const pace = 1 + randomPaceRatio(random);
      const hue = Math.floor(random() * 360);
      const symbolRoll = random();
      const subtleDot = random() < config.subtleDotChance;
      const symbol = subtleDot ? 8 : symbolRoll < config.triangleChance ? 6 + Math.floor(random() * 2)
        : symbolRoll < config.triangleChance + config.cardSuitChance ? 9 + Math.floor(random() * config.cardSuits.length)
        : nonTriangleSymbols[Math.floor(random() * nonTriangleSymbols.length)];
      const rareWhite = random() < config.rareWhiteChance;
      const color = subtleDot ? config.subtleDotColor : rareWhite ? config.white : symbol >= 9
        ? symbol === 10 || symbol === 11 ? config.cardColors.red : config.cardColors.black
        : `hsl(${hue} ${config.symbolColor.saturation}% ${config.symbolColor.lightness}%)`;
      const idle = random() < config.idleChance;
      const now = sketch.millis();
      const moveDuration = lightDuration / pace;
      const nextStep = now + random() * stepInterval / pace;
      return {
        id,
        random,
        x,
        y,
        fromX: x,
        fromY: y,
        color,
        symbol,
        subtleDot,
        size: random() < config.symbolSizeChance ? config.symbolSizes[0] : config.symbolSizes[1],
        pace,
        idle,
        moveStarted: now,
        moveDuration,
        nextStep: idle ? Infinity : nextStep,
        trail: [],
      };
    });
  }

  function stepAgent(agent, now) {
    const cols = columns();
    const rowCount = rows();
    agent.trail.unshift([agent.x, agent.y]);
    agent.trail.length = Math.min(agent.trail.length, config.trailAlphas.length);

    const moves = [];
    if (agent.y > 0) moves.push([0, -1]);
    if (agent.x < cols - 1) moves.push([1, 0]);
    if (agent.y < rowCount - 1) moves.push([0, 1]);
    if (agent.x > 0) moves.push([-1, 0]);
    const [dx, dy] = moves[Math.floor(agent.random() * moves.length)] || [0, 0];
    agent.fromX = agent.x;
    agent.fromY = agent.y;
    agent.x += dx;
    agent.y += dy;
    agent.moveStarted = now;
    agent.moveDuration = lightDuration / agent.pace;
    agent.nextStep = now + stepInterval / agent.pace;
  }

  function drawSymbol(agent, x, y, alpha, size = 0.62, glow = false) {
    const ctx = sketch.drawingContext;
    const centerX = (x + 0.5) * config.cellSize;
    const centerY = (y + 0.5) * config.cellSize;
    const radius = config.cellSize * size / 2;
    const glowScale = agent.subtleDot ? 0.15 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = agent.color;
    ctx.fillStyle = agent.color;
    ctx.lineWidth = Math.max(2, config.cellSize * 0.09);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = agent.color;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    if (agent.symbol >= 9) {
      ctx.font = `${Math.round(radius * 1.8)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (glow) {
        if (glow === "trail") {
          ctx.globalAlpha = alpha * config.trailGlow.alpha * glowScale;
          ctx.shadowBlur = config.trailGlow.blur * glowScale;
          ctx.fillText(config.cardSuits[agent.symbol - 9], centerX, centerY);
        } else {
          ctx.globalAlpha = alpha * config.headGlow.outerAlpha * glowScale;
          ctx.shadowBlur = config.headGlow.outerBlur * glowScale;
          ctx.fillText(config.cardSuits[agent.symbol - 9], centerX, centerY);
          ctx.globalAlpha = alpha * config.headGlow.innerAlpha * glowScale;
          ctx.shadowBlur = config.headGlow.innerBlur * glowScale;
          ctx.fillText(config.cardSuits[agent.symbol - 9], centerX, centerY);
        }
      }
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 0;
      ctx.fillText(config.cardSuits[agent.symbol - 9], centerX, centerY);
      ctx.restore();
      return;
    }
    if (agent.symbol === 0) {
      ctx.rect(centerX - radius * 0.75, centerY - radius * 0.75, radius * 1.5, radius * 1.5);
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
      ctx.arc(centerX, centerY, Math.max(1, radius * (agent.subtleDot ? 0.4 : 0.13)), 0, Math.PI * 2);
    }
    const filled = agent.symbol === 5 || agent.symbol === 7 || agent.symbol === 8;
    if (glow) {
      if (glow === "trail") {
        ctx.globalAlpha = alpha * config.trailGlow.alpha * glowScale;
        ctx.shadowBlur = config.trailGlow.blur * glowScale;
        if (filled) ctx.fill();
        else ctx.stroke();
      } else {
        ctx.globalAlpha = alpha * config.headGlow.outerAlpha * glowScale;
        ctx.shadowBlur = config.headGlow.outerBlur * glowScale;
        if (filled) ctx.fill();
        else ctx.stroke();
        ctx.globalAlpha = alpha * config.headGlow.innerAlpha * glowScale;
        ctx.shadowBlur = config.headGlow.innerBlur * glowScale;
        if (filled) ctx.fill();
        else ctx.stroke();
      }
    }
    ctx.globalAlpha = alpha;
    ctx.lineWidth = Math.max(2, config.cellSize * 0.09);
    ctx.shadowBlur = 0;
    if (filled) ctx.fill();
    else ctx.stroke();
    ctx.restore();
  }

  sketch.setup = () => {
    const container = document.getElementById("canvas");
    sketch.createCanvas(container.clientWidth, container.clientHeight).parent(container);
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
      window.setTimeout(() => { seedDisplay.textContent = label; }, 1500);
    });
    const urlSeed = new URLSearchParams(window.location.search).get("seed");
    const parsedSeed = urlSeed?.trim() ? Number(urlSeed) : NaN;
    const seedPromise = Number.isInteger(parsedSeed) && parsedSeed >= 0 && parsedSeed <= 0xffffffff
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
      if (size[0] > 0 && size[1] > 0 && (size[0] !== sketch.width || size[1] !== sketch.height)) {
        sketch.resizeCanvas(...size);
        if (seed !== undefined) {
          for (const agent of agents) {
            agent.x = Math.min(agent.x, columns() - 1);
            agent.y = Math.min(agent.y, rows() - 1);
            agent.fromX = agent.x;
            agent.fromY = agent.y;
            agent.trail = agent.trail.filter(([x, y]) => x < columns() && y < rows());
          }
        }
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
        averageFps = fpsSampleFrames * 1000 / (now - fpsSampleStart);
        fpsSampleFrames = 0;
        fpsSampleStart = now;
        if (averageFps < config.targetFrameRate * config.lowFrameRateRatio) {
          const previousAgentCount = renderedAgentCount;
          renderedAgentCount = Math.max(1, Math.floor(renderedAgentCount * (1 - config.agentReductionRatio)));
          for (let i = renderedAgentCount; i < previousAgentCount; i++) {
            const agent = agents[i];
            if (agent) {
              const cells = agent.trail.map(([x, y], age) => [x, y, config.trailAlphas[age]]);
              cells.push([agent.x, agent.y, config.headLightMaxAlpha]);
              fadingTrails.push({ agent, cells, startedAt: now });
            }
          }
        } else if (averageFps > config.targetFrameRate * config.lowFrameRateRatio) {
          renderedAgentCount = Math.min(config.maxAgentCount, renderedAgentCount + config.agentRecoveryPerSecond);
          fadingTrails = fadingTrails.filter(({ agent }) => agent.id >= renderedAgentCount);
        }
      }
      for (let i = 0; i < Math.min(renderedAgentCount, agents.length); i++) {
        const agent = agents[i];
        if (now >= agent.nextStep) stepAgent(agent, now);
        agent.trail.forEach(([x, y], age) => drawSymbol(agent, x, y, config.trailAlphas[age], agent.size, age === 0 ? "trail" : false));
        const progress = Math.min(1, Math.max(0, (now - agent.moveStarted) / agent.moveDuration));
        const eased = progress * progress * (3 - 2 * progress);
        if (agent.idle || agent.x !== agent.fromX || agent.y !== agent.fromY) {
          const alpha = agent.idle ? config.headLightMaxAlpha : config.headLightStartAlpha + (config.headLightMaxAlpha - config.headLightStartAlpha) * eased;
          drawSymbol(agent, agent.x, agent.y, alpha, agent.size, true);
        }
      }
      fadingTrails = fadingTrails.filter(({ startedAt }) => now - startedAt < config.removedAgentTrailFadeMs);
      for (const { agent, cells, startedAt } of fadingTrails) {
        const fade = 1 - (now - startedAt) / config.removedAgentTrailFadeMs;
        cells.forEach(([x, y, alpha]) => drawSymbol(agent, x, y, alpha * fade, agent.size));
      }
    }
    if (sketch.frameCount % 4 === 0) {
      stats.textContent = `${Math.round(averageFps)} FPS avg`;
    }
  };
});
