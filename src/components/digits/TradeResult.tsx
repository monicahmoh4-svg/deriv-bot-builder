import React, { useEffect, useState } from 'react';
import type { ContractResult } from '../../hooks/digits/useDigitTrade';
import './TradeResult.scss';

interface Props {
    result: ContractResult | null;
    onClose: () => void;
}

export const TradeResult: React.FC<Props> = ({ result, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (result && result.status !== 'pending') {
            setVisible(true);
            const t = setTimeout(() => { setVisible(false); onClose(); }, 4000);
            return () => clearTimeout(t);
        }
    }, [result, onClose]);

    if (!visible || !result || result.status === 'pending') return null;
    const won = result.status === 'won';

    return (
        <div className={`trade-result trade-result--${won ? 'won' : 'lost'}`}>
            <div className='trade-result__icon'>{won ? '✓' : '✗'}</div>
            <div className='trade-result__info'>
                <div className='trade-result__status'>{won ? 'You won!' : 'You lost'}</div>
                <div className='trade-result__amount'>{won ? '+' : '-'}${Math.abs(result.profit ?? 0).toFixed(2)}</div>
                {result.exitDigit !== undefined && (
                    <div className='trade-result__digit'>Exit digit: <strong>{result.exitDigit}</strong></div>
                )}
            </div>
            <button type='button' className='trade-result__close' onClick={() => { setVisible(false); onClose(); }}>✕</button>
        </div>
    );
};
