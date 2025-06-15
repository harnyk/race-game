import React, { useEffect, useRef, useState } from 'react';
import MenuOption from './MenuOption';

export interface PauseMenuProps {
    onExit: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ onExit }) => {
    const options = [
        { label: 'Option 1', onSelect: () => console.log('Option 1 selected') },
        { label: 'Option 2', onSelect: () => console.log('Option 2 selected') },
        { label: 'Option 3', onSelect: () => console.log('Option 3 selected') },
        { label: 'Exit', onSelect: () => { console.log('Exit selected'); onExit(); } },
    ];
    const [selected, setSelected] = useState(0);
    const refs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        refs.current[selected]?.focus();
    }, [selected]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'ArrowUp') {
                e.preventDefault();
                setSelected((i) => (i - 1 + options.length) % options.length);
            } else if (e.code === 'ArrowDown') {
                e.preventDefault();
                setSelected((i) => (i + 1) % options.length);
            } else if (e.code === 'Enter') {
                e.preventDefault();
                options[selected].onSelect();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [options, selected]);

    return (
        <div className="flex items-center justify-center w-full h-full bg-black bg-opacity-50">
            <div className="w-64 bg-gray-800 bg-opacity-90 rounded p-4 text-center">
                <h2 className="text-red-600 font-mono text-xl mb-2">Menu</h2>
                <h3 className="text-red-600 font-mono text-lg mb-4">The Drift</h3>
                {options.map((opt, idx) => (
                    <MenuOption
                        key={opt.label}
                        label={opt.label}
                        onSelect={opt.onSelect}
                        selected={idx === selected}
                        buttonRef={(el: HTMLButtonElement | null) => {
                            refs.current[idx] = el;
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default PauseMenu;
