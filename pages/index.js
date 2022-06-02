import Canvas from '../src/components/canvas';

import { container, content } from '../src/styles/index.module.css';

function Home(props) {
  return (
    <>
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