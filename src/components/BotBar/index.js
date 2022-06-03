import { useEffect, useContext } from 'react';

import { AppContext } from '../Layout';

import { botBar } from './styles.module.css';

export default function BottomBar() {
  const { fxHash, res } = useContext(AppContext);

  return (
    <div className={botBar}>{fxHash && fxHash !== "oo" && `Art hash: ${fxHash} ${res}`}</div>
  );
}