/**
 * Beat the house box
 *
 * Goal: Win a million dollars
 */
class Box {
  async createInstance() {
    const prng = await import("./prng.js").then((module) => {
      return module.default;
    });

    let flagFound = false;
    let lastRollSkipped = false;
    const goal = 1_000_000; // 1 000 000 $

    let balance = 100; // 100 $

    const houseEdge = 1; // 2% house edge
    const maxRoll = 6; // 6-sided die

    let clientSeed = window.crypto.getRandomValues(new Uint32Array(1))[0] >>> 0;
    let serverSeed = prng.rand();
    let nonce = 0;

    let streak = 0;

    const seedHistory = [];

    function nextServerSeed() {
      seedHistory.push("0x" + serverSeed.toString(16).padStart(8, "0"));
      serverSeed = prng.rand();
    }

    async function sha256(message) {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      return crypto.subtle.digest("SHA-256", data).then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      });
    }

    async function getOutcome() {
      const hash = await sha256(`${serverSeed}:${clientSeed}:${nonce}`);
      const outcome = (parseInt(hash.slice(0, 8), 16) % maxRoll) + 1; // [1, 6]
      return outcome;
    }

    function isWin(outcome, threshold) {
      return outcome < threshold;
    }

    function getProbability(threshold) {
      return (threshold - 1) / maxRoll;
    }

    function getMultiplier(threshold) {
      return (1 - houseEdge / 100) / getProbability(threshold);
    }

    async function getPayout(wager, threshold) {
      const multiplier = getMultiplier(threshold);
      const outcome = await getOutcome();
      return wager * multiplier;
    }

    async function getProfit(wager, threshold) {
      const payout = await getPayout(wager, threshold);
      return payout - wager;
    }

    async function roll(wager, threshold) {
      if (wager < 1 || wager > balance) {
        throw new Error(`Not enough balance.`);
      }

      if (threshold < 1 || threshold > maxRoll) {
        throw new Error(`Invalid 1d6 threshold.`);
      }

      const outcome = await getOutcome();

      if (isWin(outcome, threshold)) {
        // Win
        streak += 1;
        balance += await getProfit(wager, threshold);
        if (streak % 2 === 0) {
          nextServerSeed();
        }
        if (!flagFound && balance >= goal) {
          flagFound = true;
          alert("Nice!");
        }
      } else {
        // Lose
        streak = 0;
        balance -= wager;
      }

      nonce += 1;
      lastRollSkipped = false;
      return outcome;
    }

    function skip() {
      if (lastRollSkipped) {
        throw new Error("Cannot skip two rolls in a row.");
      }
      nonce += 1;
      lastRollSkipped = true;
    }

    function setClientSeed(seed) {
      clientSeed = seed >>> 0;
      nextServerSeed();
      nonce = 0;
      streak = 0;
    }

    function getClientSeed() {
      return clientSeed;
    }

    function getSeedHistory() {
      return seedHistory;
    }

    function getBalance() {
      return balance;
    }

    function getStreak() {
      return streak;
    }

    function getFlag() {
      if (flagFound) {
        return "HTB{l1n34r_pr0ph3t_pwns_th3_h0us3}";
      } else {
        throw new Error("404: Flag not found.");
      }
    }

    return {
      roll,
      skip,
      setClientSeed,
      getClientSeed,
      isWin,
      getSeedHistory,
      getBalance,
      getStreak,
      getProbability,
      getMultiplier,
      getFlag,
    };
  }
}

export default Box;
