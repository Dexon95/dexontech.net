import Box from "./ctf.js";

//
// Navigation
//

function setupNavigation() {
  const screens = document.querySelectorAll(".screen");
  const routes = new Set([...screens].map((screen) => screen.id));

  function getScreenFromLocation() {
    const route = window.location.pathname.replace(/^\/+|\/+$/g, "") || "home";

    return routes.has(route) ? route : "home";
  }

  function showScreen(id) {
    for (const screen of screens) {
      screen.classList.toggle("hidden", screen.id !== id);
    }

    window.dispatchEvent(new CustomEvent("screenchange", { detail: id }));
  }

  function navigate(target) {
    if (!routes.has(target)) {
      return;
    }

    history.pushState(null, "", target === "home" ? "/" : `/${target}`);
    showScreen(target);
  }

  for (const link of document.querySelectorAll("[data-nav]")) {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const target = link.dataset.nav;

      navigate(target);
    });
  }

  window.addEventListener("popstate", () => {
    showScreen(getScreenFromLocation());
  });

  showScreen(getScreenFromLocation());
}

setupNavigation();

//
// Create game
//

const box = await new Box().createInstance();

//
// DOM
//

const balanceElement = document.getElementById("ctf-balance");

const flagElement = document.getElementById("ctf-flag");

const rollForm = document.getElementById("ctf-roll-form");

const wagerInput = document.getElementById("ctf-wager");

const thresholdInput = document.getElementById("ctf-threshold");

const skipButton = document.getElementById("ctf-skip-btn");

const seedForm = document.getElementById("ctf-seed-form");

const clientSeedInput = document.getElementById("ctf-client-seed");
clientSeedInput.defaultValue = box.getClientSeed();

const thresholdValue = document.getElementById("ctf-threshold-value");

const winChance = document.getElementById("ctf-win-chance");

const multiplier = document.getElementById("ctf-multiplier");

const seedHistoryElement = document.getElementById("ctf-seed-history");

const logElement = document.getElementById("ctf-log");

//
// UI helpers
//

function updateStats() {
  balanceElement.textContent = box.getBalance().toFixed(2);
  try {
    flagElement.textContent = box.getFlag();
    flagElement.parentElement.classList.remove("hidden");
  } catch (error) {
    flagElement.textContent = "--";
    flagElement.parentElement.classList.add("hidden");
  }
}

function addLog(message) {
  const entry = document.createElement("p");

  entry.textContent = message;

  logElement.prepend(entry);
  console.debug(message);
}

function updateSeedHistory() {
  // reverse seed history so that the most recent seed is at the top
  const history = box.getSeedHistory().slice().reverse();

  seedHistoryElement.innerHTML = "";

  for (const seed of history) {
    const item = document.createElement("li");

    item.textContent = seed;

    seedHistoryElement.appendChild(item);
  }

  console.debug("Seed history:", box.getSeedHistory());
}

function updateThreshold() {
  const threshold = Number(thresholdInput.value);

  thresholdValue.textContent = threshold;

  const chance = box.getProbability(threshold) * 100;

  winChance.textContent = `${chance.toFixed(1)}%`;

  const mult = box.getMultiplier(threshold);

  multiplier.textContent = `${mult.toFixed(2)}*`;

  console.debug(
    `Threshold updated: ${threshold}, Win Chance: ${chance.toFixed(1)}%, Multiplier: ${mult.toFixed(2)}`,
  );
}

thresholdInput.addEventListener("input", updateThreshold);

//
// Roll
//

rollForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const wager = Number(wagerInput.value);

  const threshold = Number(thresholdInput.value);

  try {
    const outcome = await box.roll(wager, threshold);

    if (box.isWin(outcome, threshold)) {
      addLog(`WIN - roll ${outcome}`);
    } else {
      addLog(`LOSS - roll ${outcome}`);
    }

    updateStats();
    updateSeedHistory();
  } catch (error) {
    addLog(`ERROR: ${error.message}`);
  }
});

//
// Skip
//

skipButton.addEventListener("click", () => {
  try {
    box.skip();

    addLog("Skipped nonce");
  } catch (error) {
    addLog(`ERROR: ${error.message}`);
  }
});

//
// Client seed
//

seedForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const seed = Number(clientSeedInput.value);

  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    addLog("Invalid uint32 seed");

    return;
  }

  box.setClientSeed(seed);

  addLog(`Client seed set to ${seed}`);

  updateSeedHistory();
  updateStats();
});

//
// Initial render
//

updateStats();
updateSeedHistory();
updateThreshold();

//
// Ethereum block monitor
//

const ethElements = {
  status: document.getElementById("eth-status"),
  updated: document.getElementById("eth-updated"),
  number: document.getElementById("eth-number"),
  age: document.getElementById("eth-age"),
  transactions: document.getElementById("eth-transactions"),
  gas: document.getElementById("eth-gas"),
  hash: document.getElementById("eth-hash"),
  parent: document.getElementById("eth-parent"),
  miner: document.getElementById("eth-miner"),
  stateRoot: document.getElementById("eth-state-root"),
  gasLimit: document.getElementById("eth-gas-limit"),
  baseFee: document.getElementById("eth-base-fee"),
  hexPanel: document.querySelector(".eth-hex-panel"),
  hexTitle: document.querySelector(".eth-hex-title"),
  hex: document.getElementById("eth-hex"),
  log: document.getElementById("eth-block-log"),
};

const demoBlock = {
  number: "0x10d4f",
  timestamp: "0x55c9ea07",
  hash: "0x7eb7c23a5ac2f2d70aa1ba4e5c56d89de5ac993590e5f6e79c394e290d998ba8",
  parentHash:
    "0xf8d01370e6e274f8188954fbee435b40c35b2ad3d4ab671f6d086cd559e48f04",
  miner: "0xf927a40c8b7f6e07c5af7fa2155b4864a4112b13",
  stateRoot:
    "0xd64a0f63e2c7f541e6e6f8548a10a5c4e49fda7ac1aa80f9dddef648c7b9e25f",
  gasLimit: "0x2fefd8",
  gasUsed: "0x5208",
  baseFeePerGas: "0xba43b7400",
  transactionsRoot:
    "0x4a5b78c13d11559c9541576834b5172fe8b18507c0f9f76454fcdddedd8dff7a",
  transactions: [
    "0xa442249820de6be754da81eafbd44a865773e4b23d7c0522d31fd03977823008",
  ],
};

function fromHex(value) {
  return Number.parseInt(value || "0x0", 16);
}

function prettyHex(value) {
  return value || "0x0";
}

function makeHexDump(block) {
  // Ethereum roots and transaction hashes are complete 32-byte (256-bit) values.
  const transactionHashes = (block.transactions || [])
    .map((transaction) =>
      typeof transaction === "string" ? transaction : transaction.hash,
    )
    .filter(Boolean);
  const bytes = [block.transactionsRoot, ...transactionHashes]
    .filter(Boolean)
    .join("")
    .replaceAll("0x", "")
    .padEnd(64, "0");
  const lines = [];

  for (let offset = 0; offset < bytes.length / 2; offset += 32) {
    const chunk = bytes.slice(offset * 2, offset * 2 + 64).padEnd(64, "0");
    const groups = chunk.match(/.{2}/g) || [];
    const ascii = groups
      .map((byte) => {
        const code = Number.parseInt(byte, 16);
        return code >= 32 && code <= 126 ? String.fromCharCode(code) : ".";
      })
      .join("");

    lines.push(
      `${offset.toString(16).padStart(4, "0")}  ${groups.join(" ")}  |${ascii}|`,
    );
  }

  return lines.join("\n");
}

function fitHexPanelText() {
  const { hexPanel, hexTitle, hex } = ethElements;
  const fontSizes = [22, 11, 10];
  const fitPadding = 1;

  if (!hexPanel.clientWidth) {
    return;
  }

  const renderedTextWidth = (element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().width;
  };

  // Departure Mono renders pixel-perfectly at 11px increments. Select the
  // largest native size that fits instead of applying a fractional scale.
  const titleStyle = getComputedStyle(hexTitle);
  const titleWidth =
    hexTitle.getBoundingClientRect().width -
    Number.parseFloat(titleStyle.paddingInlineStart) -
    Number.parseFloat(titleStyle.paddingInlineEnd);
  const fontSize = fontSizes.find((candidate) => {
    hexPanel.style.setProperty("--eth-hex-font-size", `${candidate}px`);
    return (
      renderedTextWidth(hexTitle) <= titleWidth - fitPadding &&
      renderedTextWidth(hex) <= hex.getBoundingClientRect().width - fitPadding
    );
  }) ?? 10;
  hexPanel.style.setProperty("--eth-hex-font-size", `${fontSize}px`);
}

function renderBlock(block, isLive = false) {
  const timestamp = fromHex(block.timestamp) * 1000;
  const secondsOld = timestamp
    ? Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
    : 0;
  const baseFee = block.baseFeePerGas
    ? `${(Number(BigInt(block.baseFeePerGas) / 10000000n) / 100).toFixed(2)} GWEI`
    : "N/A";

  ethElements.number.textContent = `#${fromHex(block.number).toLocaleString()}`;
  ethElements.age.textContent = timestamp ? `${secondsOld}s AGO` : "UNKNOWN";
  ethElements.transactions.textContent = `${block.transactions?.length ?? 0} TX`;
  ethElements.gas.textContent = `${fromHex(block.gasUsed).toLocaleString()} / ${fromHex(block.gasLimit).toLocaleString()}`;
  ethElements.hash.textContent = prettyHex(block.hash);
  ethElements.parent.textContent = prettyHex(block.parentHash);
  ethElements.miner.textContent = prettyHex(block.miner);
  ethElements.stateRoot.textContent = prettyHex(block.stateRoot);
  ethElements.gasLimit.textContent = prettyHex(block.gasLimit);
  ethElements.baseFee.textContent = baseFee;
  ethElements.hex.textContent = makeHexDump(block);
  fitHexPanelText();
  ethElements.updated.textContent = isLive
    ? `UPDATED ${new Date().toLocaleTimeString()}`
    : "DEMO DATA // NODE UNAVAILABLE";
  ethElements.log.textContent = isLive
    ? `NEW BLOCK #${fromHex(block.number).toLocaleString()} RECEIVED_`
    : "DISPLAYING CACHED BLOCK FORMAT_";
}

let lastEthBlock;

async function requestLatestEthBlock() {
  const response = await fetch("https://ethereum-rpc.publicnode.com", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBlockByNumber",
      params: ["latest", false],
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC returned ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error || !payload.result) {
    throw new Error(payload.error?.message || "No block returned");
  }

  return payload.result;
}

async function refreshEthBlock() {
  try {
    const block = await requestLatestEthBlock();

    if (block.number !== lastEthBlock) {
      renderBlock(block, true);
      lastEthBlock = block.number;
    }

    ethElements.status.textContent = "LIVE NODE CONNECTION";
  } catch (error) {
    if (!lastEthBlock) {
      renderBlock(demoBlock);
    }

    ethElements.status.textContent = "NODE RETRYING";
  }
}

renderBlock(demoBlock);
new ResizeObserver(fitHexPanelText).observe(ethElements.hexPanel);
window.addEventListener("resize", fitHexPanelText);
document.fonts?.ready.then(fitHexPanelText);
refreshEthBlock();
window.setInterval(refreshEthBlock, 12_000);

//
// Conway's Game of Life monitor
//

const lifeCanvas = document.getElementById("life-canvas");
const lifeContext = lifeCanvas.getContext("2d");
const lifeCellSize = 20;
const lifeStepInterval = 200;
let lifeColumns = 0;
let lifeRows = 0;
let lifeCells = new Uint8Array();
let lifeTimer;

function seedLife() {
  lifeCells = new Uint8Array(lifeColumns * lifeRows);

  for (let index = 0; index < lifeCells.length; index += 1) {
    lifeCells[index] = Math.random() < 0.27 ? 1 : 0;
  }
}

function resizeLife() {
  const bounds = lifeCanvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  lifeCanvas.width = Math.floor(bounds.width * pixelRatio);
  lifeCanvas.height = Math.floor(bounds.height * pixelRatio);
  lifeContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const nextColumns = Math.max(1, Math.floor(bounds.width / lifeCellSize));
  const nextRows = Math.max(1, Math.floor(bounds.height / lifeCellSize));

  if (nextColumns !== lifeColumns || nextRows !== lifeRows) {
    lifeColumns = nextColumns;
    lifeRows = nextRows;
    seedLife();
  }

  drawLife();
}

function drawLife() {
  const canvasWidth = lifeCanvas.clientWidth;
  const canvasHeight = lifeCanvas.clientHeight;
  const width = lifeColumns * lifeCellSize;
  const height = lifeRows * lifeCellSize;
  const offsetX = Math.floor((canvasWidth - width) / 2);
  const offsetY = Math.floor((canvasHeight - height) / 2);
  lifeContext.fillStyle = "#e7eadc";
  lifeContext.fillRect(0, 0, canvasWidth, canvasHeight);

  for (let y = 0; y < lifeRows; y += 1) {
    for (let x = 0; x < lifeColumns; x += 1) {
      if (lifeCells[y * lifeColumns + x]) {
        const cellX = offsetX + x * lifeCellSize;
        const cellY = offsetY + y * lifeCellSize;
        const centerX = cellX + lifeCellSize / 2;
        const centerY = cellY + lifeCellSize / 2;
        const aura = lifeContext.createRadialGradient(
          centerX,
          centerY,
          lifeCellSize * 0.35,
          centerX,
          centerY,
          lifeCellSize * 1.45,
        );
        aura.addColorStop(0, "rgba(91, 105, 88, 0.28)");
        aura.addColorStop(0.55, "rgba(135, 147, 128, 0.12)");
        aura.addColorStop(1, "rgba(135, 147, 128, 0)");
        lifeContext.fillStyle = aura;
        lifeContext.fillRect(
          cellX - lifeCellSize,
          cellY - lifeCellSize,
          lifeCellSize * 3,
          lifeCellSize * 3,
        );

        lifeContext.fillStyle = "#000";
        lifeContext.fillRect(
          cellX + 1,
          cellY + 1,
          lifeCellSize - 2,
          lifeCellSize - 2,
        );
      }
    }
  }
}

function stepLife() {
  const nextCells = new Uint8Array(lifeCells.length);

  for (let y = 0; y < lifeRows; y += 1) {
    for (let x = 0; x < lifeColumns; x += 1) {
      let neighbors = 0;
      for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (offsetX === 0 && offsetY === 0) continue;
          const neighborX = (x + offsetX + lifeColumns) % lifeColumns;
          const neighborY = (y + offsetY + lifeRows) % lifeRows;
          neighbors += lifeCells[neighborY * lifeColumns + neighborX];
        }
      }

      const index = y * lifeColumns + x;
      nextCells[index] = neighbors === 3 || (lifeCells[index] && neighbors === 2);
    }
  }

  lifeCells = nextCells;
  drawLife();
}

function setLifeRunning(isRunning) {
  window.clearInterval(lifeTimer);
  lifeTimer = undefined;

  if (isRunning) {
    resizeLife();
    lifeTimer = window.setInterval(stepLife, lifeStepInterval);
  }
}

new ResizeObserver(resizeLife).observe(lifeCanvas);
window.addEventListener("screenchange", (event) => {
  setLifeRunning(event.detail === "life");
});
setLifeRunning(window.location.pathname === "/life");
