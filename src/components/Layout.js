import { createContext, useState } from 'react';
import TopBar from "./TopBar/TopBar";
import BotBar from "./BotBar/BotBar";

export const AppContext = createContext(null);

export default (props) => {
  const [res, setRes] = useState('(0x0)');
  const [isLoading, setIsLoading] = useState(true);
  const [fxHash, setFxHash] = useState('oo');

  return (
    <>
      <AppContext.Provider value={{ isLoading, setIsLoading, fxHash, setFxHash, res, setRes }}>
        <TopBar />
        {props.children}
        <BotBar />
      </AppContext.Provider>
    </>
  );
}