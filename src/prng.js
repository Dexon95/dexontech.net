class PRNG {
  #N;
  #M;
  #b;
  #MASK;
  #MAGIC;

  constructor() {
    this.#N = 16;
    this.#M = 7;
    this.#b = 32;
    this.#MASK = 0xffffffff;
    this.#MAGIC = 0xffc0ffee;
  }

  rol(x, d) {
    x = x >>> 0;
    const ans = ((x << d) & this.#MASK) >>> 0;
    return (ans | (x >>> (this.#b - d))) >>> 0;
  }

  createPRNG() {
    let index = this.#N;
    let STATE;

    const N = this.#N;
    const M = this.#M;
    const b = this.#b;
    const MAGIC = this.#MAGIC;
    const rol = this.rol.bind(this);

    if (!!STATE) {
      if (STATE.length !== N) {
        throw new Error(`state must have length ${N}`);
      }
      STATE = STATE.slice();
    } else {
      STATE = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        STATE[i] = buf[0] >>> 0;
      }
    }

    function twist() {
      for (let i = 0; i < N; i++) {
        STATE[i] ^= rol(STATE[(i + 1) % N], 3);
        STATE[i] ^= rol(STATE[(i + M) % N], b - 9);
        STATE[i] ^= MAGIC;
        STATE[i] >>>= 0;
      }
    }

    function rand() {
      if (index >= N) {
        twist();
        index = 0;
      }
      let y = STATE[index] >>> 0;
      y ^= rol(y, 7);
      y ^= rol(y, b - 15);
      index += 1;
      return y >>> 0;
    }

    return { rand };
  }
}

export default new PRNG().createPRNG();
