import React from 'react';
import './DigitPicker.scss';

interface Props {
    value: number;
    onChange: (digit: number) => void;
    contractType: string;
    winDigits?: number[];
}

export const DigitPicker: React.FC<Props> = ({ value, onChange, contractType, winDigits = [] }) => (
    <div className='digit-picker'>
        <div className='digit-picker__label'>
            {contractType === 'DIGITOVER' || contractType === 'DIGITUNDER' ? 'Barrier' : 'Prediction'}
        </div>
        <div className='digit-picker__grid'>
            {[0,1,2,3,4,5,6,7,8,9].map(digit => (
                <button
                    key={digit}
                    type='button'
                    className={`digit-btn ${value === digit ? 'digit-btn--selected' : ''} ${winDigits.includes(digit) ? 'digit-btn--win' : ''}`}
                    onClick={() => onChange(digit)}
                >
                    {digit}
                </button>
            ))}
        </div>
    </div>
);
