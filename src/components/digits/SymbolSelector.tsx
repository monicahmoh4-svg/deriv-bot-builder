import React, { useState } from 'react';
import type { SymbolInfo } from '../../hooks/digits/useSymbols';
import './SymbolSelector.scss';

interface Props {
    symbols: SymbolInfo[];
    selected: string;
    onChange: (symbol: string) => void;
}

export const SymbolSelector: React.FC<Props> = ({ symbols, selected, onChange }) => {
    const [open, setOpen] = useState(false);
    const selectedInfo = symbols.find(s => s.symbol === selected);

    return (
        <div className={`symbol-selector ${open ? 'symbol-selector--open' : ''}`}>
            <button type='button' className='symbol-selector__trigger' onClick={() => setOpen(o => !o)}>
                <span className='symbol-selector__name'>{selectedInfo?.display_name ?? selected}</span>
                <span className='symbol-selector__arrow'>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className='symbol-selector__dropdown'>
                    {symbols.map(sym => (
                        <button
                            key={sym.symbol}
                            type='button'
                            className={`symbol-option ${sym.symbol === selected ? 'symbol-option--active' : ''}`}
                            onClick={() => { onChange(sym.symbol); setOpen(false); }}
                        >
                            <span className='symbol-option__name'>{sym.display_name}</span>
                            <span className='symbol-option__code'>{sym.symbol}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
