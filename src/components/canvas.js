import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import PQueue from 'p-queue';

import { fx, stopLoading } from '../utils';

import { canvasContainer } from '../styles/p5Canvas.module.css';

// Will only import `react-p5` on client-side
const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
});

const Q = new PQueue({ concurrency: 5 });

export default function Canvas({ query }) {
  var FX, w, h;

  const _Canvas = useRef(null);

  const setup = (p5, canvasParentRef) => {
    w = p5.windowWidth;
    h = p5.windowHeight;
    _Canvas.current = p5.createCanvas(w, h).parent(canvasParentRef);
  };

  const draw = async (p5) => {
    FX = fx(query.h ? query.h : typeof query.reset === 'string');

    p5.noLoop();
    p5.background(0);
    p5.colorMode(p5.HSB);

    const size = 128;

    const dxL = Math.floor(w / size);
    const dyL = Math.floor(h / size);

    const paddingW = Math.floor((w / 2) - (size * dxL / 2));
    const paddingH = Math.floor((h / 2) - (size * dyL / 2));

    const bgColor = { hue: 21, saturation: 5, brightness: 10 };
    const blockColor = genNewColor();

    _Canvas.current.loadPixels();

    // grain effect
    for (let x = 0; x < w; x += size) {
      for (let y = 0; y < h; y += size) {
        Q.add(async () => setBlockGrain(p5, { x, y, size }, bgColor));
      }
    }

    // colored grain blocks
    Array.from({
      length: dxL * dyL
    }).map((v, i, self) => {
      return FX.rand() >= 0.05 ? { miss: true } : {
        miss: false,
        x: Math.floor(i % dxL) * size + paddingW,
        y: Math.floor(i / dxL) * size + paddingH,
        size
      };
    }).forEach(newBlock => {
      if (!newBlock.miss) {
        Q.add(async () => {
          const b = FX.randomItemFromArray(['light', 'dark']);
          const newColor = { ...blockColor, brightness: (b === 'dark' ? FX.randomInt(10, 20) : FX.randomInt(40, 60)) };
          setBlockGrain(p5, newBlock, newColor);
        });
      }
    });

    await Q.onIdle();

    _Canvas.current.updatePixels();

    stopLoading();
  };

  const windowResized = (p5) => {
    w = p5.windowWidth;
    h = p5.windowHeight;
    p5.resizeCanvas(w, h);
  };

  const setBlockGrain = (p5, block, newColor) => {
    for (let x = block.x; x < Math.min(w, block.x + block.size); x++) {
      for (let y = block.y; y < Math.min(h, block.y + block.size); y++) {
        setGrainColor(p5, x, y, newColor);
      }
    }
  };

  const setGrainColor = (p5, x, y, { hue, saturation: s, brightness: b }) => {
    _Canvas.current.set(x, y, p5.color(hue, s, FX.randomInt(b - 7, b + 7)));
  };

  /**
   * 
   * @returns {object} HSB color {hue, saturation, brightness}
   */
  const genNewColor = () => {
    return {
      hue: FX.randomInt(25, 200),
      saturation: FX.randomInt(25, 75),
      brightness: FX.randomInt(75, 100)
    };
  };

  return (
    <Sketch setup={setup} draw={draw} windowResized={windowResized} className={canvasContainer} />
  );
};