import { useContext, useState } from 'react';
import { Tooltip, Button, Row, Col } from 'antd';

import { AppContext } from '../Layout';

import styles from './styles.module.css';

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
    <div className={styles.botBar}>
      <Row>
        <Col xs={{ span: 24 }} sm={{ span: 0 }}>
          {fxHash && fxHash !== "oo" &&
            <>
              <Tooltip title={isCopied ? "Copied!" : "Share"} color={isCopied ? "#52C41A" : ""}>
                <Button type="text" onClick={copyHashToClipboard} className={styles.btn}>Share Hash</Button>
              </Tooltip>
            </>
          }
        </Col>
        <Col xs={{ span: 0 }} sm={{ span: 24 }}>
          {fxHash && fxHash !== "oo" &&
            <>
              Art Hash:
              <Tooltip title={isCopied ? "Copied!" : "Share"} color={isCopied ? "#52C41A" : ""}>
                <Button type="text" onClick={copyHashToClipboard} className={styles.btn}>{fxHash}</Button>
              </Tooltip>
              {res}
            </>
          }
        </Col>
      </Row>
    </div>
  );
}