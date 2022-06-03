import { useContext } from 'react';
import { Row, Col, Tooltip } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faNodeJs,
  faReact,
  faBootstrap,
  faHtml5,
  faUbuntu
} from '@fortawesome/free-brands-svg-icons';
import {
  faBitcoinSign,
  faCloud,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';

import { AppContext } from '../src/components/Layout';

import Loading from '../src/components/Loading';
import Canvas from '../src/components/Canvas';

import {
  nodejs_color,
  react_color,
  bootstrap_color,
  bitcoin_color,
  html_color,
  cloud_color,
  ubuntu_color,
  postgresql_color
} from '../src/styles/icon.module.css';
import { container, content, techContainer } from '../src/styles/index.module.css';

function Home(props) {
  const { isLoading } = useContext(AppContext);

  return (
    <>
      {isLoading && <Loading />}
      <Canvas query={props.query} />
      <div className={container}>
        <Row>
          <Col xs={{ span: 24 }} className={content}>
            contact@dexontech.net
          </Col>
          <Col xs={{ span: 24 }} className={techContainer}>
            <Tooltip title="Node.js" placement="bottom">
              <FontAwesomeIcon icon={faNodeJs} size="2xl" className={nodejs_color} />
            </Tooltip>
            <Tooltip title="React" placement="bottom">
              <FontAwesomeIcon icon={faReact} size="2xl" className={react_color} />
            </Tooltip>
            <Tooltip title="Bootstrap" placement="bottom">
              <FontAwesomeIcon icon={faBootstrap} size="2xl" className={bootstrap_color} />
            </Tooltip>
            <Tooltip title="Cryptocoin" placement="bottom">
              <FontAwesomeIcon icon={faBitcoinSign} size="2xl" className={bitcoin_color} />
            </Tooltip>
            <Tooltip title="HTML5 & CSS3" placement="bottom">
              <FontAwesomeIcon icon={faHtml5} size="2xl" className={html_color} />
            </Tooltip>
            <Tooltip title="Cloud Hosting" placement="bottom">
              <FontAwesomeIcon icon={faCloud} size="2xl" className={cloud_color} />
            </Tooltip>
            <Tooltip title="Ubuntu" placement="bottom">
              <FontAwesomeIcon icon={faUbuntu} size="2xl" className={ubuntu_color} />
            </Tooltip>
            <Tooltip title="Postgresql" placement="bottom">
              <FontAwesomeIcon icon={faDatabase} size="2xl" className={postgresql_color} />
            </Tooltip>
          </Col>
        </Row>
      </div>
    </>
  );
}

Home.getInitialProps = ({ query }) => {
  return { query };
};

export default Home;