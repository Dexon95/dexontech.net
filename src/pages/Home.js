import { useContext } from 'react';
import { useSearchParams } from "react-router-dom";
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

import { AppContext } from '../components/Layout';

import Loading from '../components/Loading/Loading';
import Canvas from '../components/Canvas/Canvas';

import iconStyle from '../styles/icon.module.css';
import homeStyle from '../styles/home.module.css';

function Home() {
  const { isLoading } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      {isLoading && <Loading />}
      <Canvas searchParams={searchParams} />
      <div className={homeStyle.container}>
        <Row>
          <Col xs={{ span: 24 }} className={homeStyle.content}>
            contact@dexontech.net
          </Col>
          <Col xs={{ span: 24 }} className={homeStyle.techContainer}>
            <Tooltip title="Node.js" placement="bottom">
              <FontAwesomeIcon icon={faNodeJs} size="2xl" className={iconStyle.nodejs_color} />
            </Tooltip>
            <Tooltip title="React" placement="bottom">
              <FontAwesomeIcon icon={faReact} size="2xl" className={iconStyle.react_color} />
            </Tooltip>
            <Tooltip title="Bootstrap" placement="bottom">
              <FontAwesomeIcon icon={faBootstrap} size="2xl" className={iconStyle.bootstrap_color} />
            </Tooltip>
            <Tooltip title="Cryptocoin" placement="bottom">
              <FontAwesomeIcon icon={faBitcoinSign} size="2xl" className={iconStyle.bitcoin_color} />
            </Tooltip>
            <Tooltip title="HTML5 & CSS3" placement="bottom">
              <FontAwesomeIcon icon={faHtml5} size="2xl" className={iconStyle.html_color} />
            </Tooltip>
            <Tooltip title="Cloud Hosting" placement="bottom">
              <FontAwesomeIcon icon={faCloud} size="2xl" className={iconStyle.cloud_color} />
            </Tooltip>
            <Tooltip title="Ubuntu" placement="bottom">
              <FontAwesomeIcon icon={faUbuntu} size="2xl" className={iconStyle.ubuntu_color} />
            </Tooltip>
            <Tooltip title="Postgresql" placement="bottom">
              <FontAwesomeIcon icon={faDatabase} size="2xl" className={iconStyle.postgresql_color} />
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