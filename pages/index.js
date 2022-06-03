import { useContext } from 'react';

import { AppContext } from '../src/components/Layout';

import Loading from '../src/components/Loading';
import Canvas from '../src/components/Canvas';

import { container, content } from '../src/styles/index.module.css';

function Home(props) {
  const { isLoading } = useContext(AppContext);

  return (
    <>
      {isLoading && <Loading />}
      <Canvas query={props.query} />
      <div className={container}>
        <span className={content}>contact@dexontech.net</span>
      </div>
    </>
  );
}

Home.getInitialProps = ({ query }) => {
  return { query };
};

export default Home;