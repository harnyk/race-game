import React, { useEffect, useState } from 'react';
import LayeredLayout from './LayeredLayout';
import GameCanvas from './GameCanvas';
import UiOverlay from './UiOverlay';
import PauseMenu from './PauseMenu';

const App: React.FC = () => {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const layers: React.ReactNode[] = [
    <GameCanvas key="game" paused={paused} />,
  ];
  if (paused) {
    layers.push(<PauseMenu key="pause" onExit={() => setPaused(false)} />);
  }
  layers.push(<UiOverlay key="ui" />);

  return <LayeredLayout layers={layers} />;
};

export default App;
