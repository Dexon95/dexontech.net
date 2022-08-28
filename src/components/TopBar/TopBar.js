import { Tooltip, Button } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJsfiddle, faGithub } from '@fortawesome/free-brands-svg-icons';

import iconStyle from '../../styles/icon.module.css';
import styles from './styles.module.css';

export default function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className="top-bar-left">
        <span className={styles.title}>Dexontech</span>
        <span className={styles.role}>Web Development</span>
      </div>
      <div className="top-bar-right">
        <Tooltip placement="bottom" title="JSFiddle">
          <Button className={iconStyle.jsfiddle_color} type="link" href="https://jsfiddle.net/user/Dexon95/fiddles" target="_blank">
            <FontAwesomeIcon icon={faJsfiddle} size="2xl" />
          </Button>
        </Tooltip>
        <Tooltip placement="bottom" title="Github">
          <Button className={iconStyle.github_color} type="link" href="https://github.com/Dexon95" target="_blank">
            <FontAwesomeIcon icon={faGithub} size="2xl" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}