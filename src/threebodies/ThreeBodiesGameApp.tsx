import GameCanvas from '../ui/GameCanvas';
import { ThreeBodiesGame } from './ThreeBodiesGame';

export const ThreeBodiesGameApp: React.FC = () => {
    return (
        <GameCanvas
            gameFactory={(canvas) => new ThreeBodiesGame(canvas)}
            paused={false}
        />
    );
};
