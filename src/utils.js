const getLocalOrDef = (key, def) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key) || def;
  } else {
    return def;
  }
};

const setLocal = (key, value) => {
  if (typeof window !== "undefined") {
    return localStorage.setItem(key, value);
  }
};

// fxhash-snippet
export const fx = (isNew = false) => {
  const alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const newHash = "oo" + Array(49).fill(0).map(_ => alphabet[(Math.random() * alphabet.length) | 0]).join('');
  const hash = typeof isNew === 'string' ? isNew : isNew ? newHash : getLocalOrDef('fxhash', newHash);
  setLocal('fxhash', hash);
  const b58dec = str => [...str].reduce((p, c) => p * alphabet.length + alphabet.indexOf(c) | 0, 0);
  const hashTrunc = hash.slice(2);
  const regex = new RegExp(".{" + ((hashTrunc.length / 4) | 0) + "}", 'g');
  const hashes = hashTrunc.match(regex).map(h => b58dec(h));
  const sfc32 = (a, b, c, d) => {
    return () => {
      a |= 0; b |= 0; c |= 0; d |= 0
      var t = (a + b | 0) + d | 0
      d = d + 1 | 0
      a = b ^ b >>> 9
      b = c + (c << 3) | 0
      c = c << 21 | c >>> 11
      c = c + t | 0
      return (t >>> 0) / 4294967296
    };
  };

  /**
   * 
   * @returns {number} Randomly distributed in [0, 1)
   */
  const rand = sfc32(...hashes);

  /**
   * 
   * @param {number} min 
   * @param {number} max 
   * @returns {integer} Randomly distributed in [min, max]
   */
  const randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(rand() * (max - min) + min);
  };

  const randomItemFromArray = (arr) => {
    return arr[randomInt(0, arr.length)];
  };

  return { hash, rand, randomInt, randomItemFromArray };
};
