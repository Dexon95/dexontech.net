import { useState, useEffect } from 'react';
import { getLocalOrDef } from '../utils';

import { botBar } from '../styles/botBar.module.css';

export default function BottomBar() {
  const [fxhash, setFxhash] = useState('');

  useEffect(() => {
    setFxhash(getLocalOrDef('fxhash', 'oo'));
  }, []);

  return (
    <div className={botBar}>Art hash: {fxhash}</div>
  );
}