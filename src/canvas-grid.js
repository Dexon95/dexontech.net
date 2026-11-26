/** @typedef {Pick<import("./catalogue.js").AgentFeatures, "shape" | "color" | "size">} AgentAppearance */

function drawShape(context, shape, center, radius) {
  if (shape.kind === "suit") {
    context.font = `${Math.round(radius * 1.8)}px serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(shape.glyph, center, center);
    return;
  }

  context.beginPath();
  switch (shape.kind) {
    case "square":
      context.rect(center - radius * 0.75, center - radius * 0.75, radius * 1.5, radius * 1.5);
      break;
    case "circle":
      context.arc(center, center, radius * 0.8, 0, Math.PI * 2);
      break;
    case "cross":
      context.moveTo(center - radius, center - radius);
      context.lineTo(center + radius, center + radius);
      context.moveTo(center - radius, center + radius);
      context.lineTo(center + radius, center - radius);
      break;
    case "plus":
      context.moveTo(center - radius, center);
      context.lineTo(center + radius, center);
      context.moveTo(center, center - radius);
      context.lineTo(center, center + radius);
      break;
    case "diamond":
    case "diamond-filled":
      context.moveTo(center, center - radius);
      context.lineTo(center + radius, center);
      context.lineTo(center, center + radius);
      context.lineTo(center - radius, center);
      context.closePath();
      break;
    case "triangle":
    case "triangle-filled":
      context.moveTo(center, center - radius);
      context.lineTo(center + radius, center + radius);
      context.lineTo(center - radius, center + radius);
      context.closePath();
      break;
    case "dot":
      context.arc(center, center, Math.max(1, radius * (shape.subtle ? 0.4 : 0.13)), 0, Math.PI * 2);
      break;
  }

  if (shape.kind === "diamond-filled" || shape.kind === "triangle-filled" || shape.kind === "dot") {
    context.fill();
  } else {
    context.stroke();
  }
}

export function createCanvasGrid(canvas, config) {
  const { cellSize, auraRadiusCells, headGlow, trailGlow } = config;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas 2D is unavailable");

  const background = `rgb(${config.background.join(" ")})`;
  const headSprites = new Map();
  const trailSprites = new Map();
  const center = cellSize * 1.5;
  const auraRadius = cellSize * auraRadiusCells;

  function createSprite({ shape, color, size }, glow) {
    const sprite = canvas.ownerDocument.createElement("canvas");
    sprite.width = sprite.height = cellSize * 3;
    const drawing = sprite.getContext("2d");
    const glowScale = shape.kind === "dot" && shape.subtle ? 0.15 : 1;
    const auraLayers = [[auraRadius, glow.outerAlpha], [auraRadius * 0.4, glow.alpha]];

    drawing.globalCompositeOperation = "screen";
    for (const [radius, strength] of auraLayers) {
      const aura = drawing.createRadialGradient(center, center, 0, center, center, radius);
      aura.addColorStop(0, color);
      aura.addColorStop(1, "transparent");
      drawing.globalAlpha = strength * glowScale;
      drawing.fillStyle = aura;
      drawing.fillRect(center - radius, center - radius, radius * 2, radius * 2);
    }
    drawing.globalCompositeOperation = "source-over";
    drawing.globalAlpha = 1;
    drawing.strokeStyle = color;
    drawing.fillStyle = color;
    drawing.lineWidth = Math.max(2, cellSize * 0.09);
    drawing.lineCap = "round";
    drawing.lineJoin = "round";
    drawShape(drawing, shape, center, cellSize * size / 2);
    return sprite;
  }

  function resize(width, height) {
    const pixelWidth = Math.max(1, Math.round(width));
    const pixelHeight = Math.max(1, Math.round(height));
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  }

  function beginFrame() {
    context.globalAlpha = 1;
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Drawing takes zero-based cell coordinates and opacity from 0 to 1.
   * @param {AgentAppearance} appearance
   */
  function addAgent(appearance) {
    const key = JSON.stringify([appearance.shape, appearance.color, appearance.size]);

    function createPainter(cache, glow) {
      let sprite;
      return (column, row, alpha) => {
        if (alpha <= 0) return;
        if (!sprite) {
          sprite = cache.get(key);
          if (!sprite) {
            sprite = createSprite(appearance, glow);
            cache.set(key, sprite);
          }
        }

        context.globalAlpha = alpha;
        context.drawImage(sprite, (column - 1) * cellSize, (row - 1) * cellSize);
      };
    }

    return {
      drawHead: createPainter(headSprites, headGlow),
      drawTrail: createPainter(trailSprites, trailGlow),
    };
  }

  return {
    get columns() { return Math.max(1, Math.floor(canvas.width / cellSize)); },
    get rows() { return Math.max(1, Math.floor(canvas.height / cellSize)); },
    resize,
    beginFrame,
    addAgent,
  };
}
