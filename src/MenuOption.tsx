import React from 'react';

export interface MenuOptionProps {
    label: string;
    onSelect: () => void;
    selected: boolean;
    buttonRef: (el: HTMLButtonElement | null) => void;
}

const MenuOption: React.FC<MenuOptionProps> = ({ label, onSelect, selected, buttonRef }) => (
    <button
        ref={buttonRef}
        onClick={onSelect}
        className={`px-4 py-2 font-mono border border-red-600 text-red-600 rounded mb-2 focus:outline-none hover:bg-red-600 hover:text-black ${selected ? 'bg-red-600 text-black' : ''}`}
    >
        {label}
    </button>
);

export default MenuOption;
