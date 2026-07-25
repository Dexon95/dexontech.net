import Box from "./ctf.js";

//
// Navigation
//

function setupNavigation() {
  const screens = document.querySelectorAll(".screen");

  function showScreen(id) {
    for (const screen of screens) {
      screen.classList.toggle("hidden", screen.id !== id);
    }
  }

  function getInitialScreen() {
    const path = window.location.pathname;

    if (path.endsWith("/ctf")) {
      return "ctf";
    }

    return "home";
  }

  for (const link of document.querySelectorAll("[data-nav]")) {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      const target = link.dataset.nav;

      history.pushState(null, "", target === "home" ? "/" : `/${target}`);

      showScreen(target);
    });
  }

  window.addEventListener("popstate", () => {
    showScreen(getInitialScreen());
  });

  showScreen(getInitialScreen());
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
