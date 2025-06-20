import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GameApp from './GameApp';
import BlackholePage from './BlackholePage';

const App: React.FC = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<GameApp />} />
            <Route path="/blackhole" element={<BlackholePage />} />
        </Routes>
    </BrowserRouter>
);

export default App;
