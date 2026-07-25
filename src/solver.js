function rol(x, d) {
  return ((x << d) | (x >>> (32 - d))) >>> 0;
}

// Convert uint32 into 32 bit array
function bits32(x) {
  const out = [];

  for (let i = 0; i < 32; i++) {
    out.push((x >>> i) & 1);
  }

  return out;
}

// Convert bit array back to uint32
function fromBits(bits) {
  let x = 0;

  for (let i = 0; i < 32; i++) {
    x |= bits[i] << i;
  }

  return x >>> 0;
}

// Build linear representation
//
// output bit = XOR(input bits)
function outputMatrix() {
  const matrix = [];

  for (let i = 0; i < 32; i++) {
    const row = [];

    for (let j = 0; j < 32; j++) {
      row.push(0);
    }

    matrix.push(row);
  }

  for (let bit = 0; bit < 32; bit++) {
    const x = 1 << bit;

    let y = x >>> 0;

    y ^= rol(y, 7);
    y ^= rol(y, 17);

    const result = bits32(y);

    for (let i = 0; i < 32; i++) {
      matrix[i][bit] = result[i];
    }
  }

  return matrix;
}

// Gaussian elimination GF(2)
function solveGF2(A, b) {
  const rows = A.length;
  const cols = A[0].length;

  const aug = A.map((r, i) => [...r, b[i]]);

  let pivot = 0;

  for (let col = 0; col < cols && pivot < rows; col++) {
    let found = -1;

    for (let r = pivot; r < rows; r++) {
      if (aug[r][col]) {
        found = r;
        break;
      }
    }

    if (found === -1) continue;

    [aug[pivot], aug[found]] = [aug[found], aug[pivot]];

    for (let r = 0; r < rows; r++) {
      if (r !== pivot && aug[r][col]) {
        for (let c = col; c <= cols; c++) {
          aug[r][c] ^= aug[pivot][c];
        }
      }
    }

    pivot++;
  }

  const solution = new Array(cols).fill(0);

  for (let r = 0; r < rows; r++) {
    let leading = -1;

    for (let c = 0; c < cols; c++) {
      if (aug[r][c]) {
        leading = c;
        break;
      }
    }

    if (leading !== -1) {
      solution[leading] = aug[r][cols];
    }
  }

  return solution;
}

// Invert output transformation
function invertOutput(output) {
  const matrix = outputMatrix();

  const b = bits32(output);

  const xBits = solveGF2(matrix, b);

  return fromBits(xBits);
}

// Main solver
export function solveState(seedStrings) {
  const outputs = seedStrings.map((x) => Number(BigInt(x)));

  const state = outputs.slice(0, 16).map(invertOutput);

  return {
    state,
    createPRNG(magic) {
      return createRecoveredPRNG([...state], magic);
    },
  };
}

export function createRecoveredPRNG(state, magic) {
  const N = 16;
  const M = 7;
  const B = 32;

  let index = 0;

  function rol(x, d) {
    return ((x << d) | (x >>> (32 - d))) >>> 0;
  }

  function twist() {
    for (let i = 0; i < N; i++) {
      state[i] ^= rol(state[(i + 1) % N], 3);
      state[i] ^= rol(state[(i + M) % N], B - 9);
      state[i] ^= magic;
      state[i] >>>= 0;
    }
  }

  function rand() {
    if (index >= N) {
      twist();
      index = 0;
    }

    let y = state[index] >>> 0;

    y ^= rol(y, 7);
    y ^= rol(y, B - 15);

    index++;

    return y >>> 0;
  }

  return {
    rand,
    getState() {
      return [...state];
    },
  };
}
