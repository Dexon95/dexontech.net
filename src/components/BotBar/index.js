import { useContext, useState, useRef } from 'react';
import { Tooltip, Button } from 'antd';

import { AppContext } from '../Layout';

import { botBar, btn } from './styles.module.css';

export default function BottomBar() {
  const [isCopied, setIsCopied] = useState(false);
  const { fxHash, res } = useContext(AppContext);

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(`https://dexontech.net/?h=${fxHash}`);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className={botBar}>
      {fxHash && fxHash !== "oo" &&
        <>
          <Tooltip title={isCopied ? "Copied!" : "Share"} color={isCopied ? "#52C41A" : ""}>
            <Button type="text" onClick={copyHashToClipboard} className={btn}>{fxHash}</Button>
          </Tooltip>
          {res}
        </>
      }
    </div>
  );
}