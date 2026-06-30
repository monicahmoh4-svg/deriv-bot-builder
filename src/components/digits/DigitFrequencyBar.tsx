import React from 'react';
import type { Tick } from '../../hooks/digits/useTickStream';
import './DigitFrequencyBar.scss';

interface Props {
    ticks: Tick[];
    digitFrequency: Record<number, number>;
    lastDigit: number | null;
    prediction?: number | null;
    contractType?: string;
}

const DIGITS = [0,1,2,3,4,5,6,7,8,9];

function getBarClass(digit: number, lastDigit: number | null, prediction: number | null | undefined, contractType?: string) {
    if (digit === lastDigit) return 'digit-bar--last';
    if (prediction == null) return 'digit-bar--neutral';
    if (contractType === 'DIGITMATCH'  && digit === prediction)  return 'digit-bar--target';
    if (contractType === 'DIGITDIFF'   && digit !== prediction)  return 'digit-bar--win';
    if (contractType === 'DIGITOVER'   && digit > prediction)    return 'digit-bar--win';
    if (contractType === 'DIGITUNDER'  && digit < prediction)    return 'digit-bar--win';
    if (contractType === 'DIGITEVEN'   && digit % 2 === 0)       return 'digit-bar--win';
    if (contractType === 'DIGITODD'    && digit % 2 !== 0)       return 'digit-bar--win';
    return 'digit-bar--neutral';
}

export const DigitFrequencyBar: React.FC<Props> = ({ ticks, digitFrequency, lastDigit, prediction, contractType }) => {
    const total = ticks.length;
    const maxFreq = Math.max(...DIGITS.map(d => digitFrequency[d] ?? 0), 1);

    return (
        <div className='digit-frequency-bar'>
            <div className='digit-frequency-bar__header'>
                <span className='digit-frequency-bar__title'>Digit Statistics</span>
                <span className='digit-frequency-bar__subtitle'>{total} ticks</span>
            </div>
            <div className='digit-frequency-bar__bars'>
                {DIGITS.map(digit => {
                    const count = digitFrequency[digit] ?? 0;
                    const pct   = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                    const h     = (count / maxFreq) * 100;
                    return (
                        <div key={digit} className={`digit-bar ${getBarClass(digit, lastDigit, prediction, contractType)}`}>
                            <span className='digit-bar__pct'>{pct}%</span>
                            <div className='digit-bar__track'>
                                <div className='digit-bar__fill' style={{ height: `${h}%` }} />
                            </div>
                            <span className={`digit-bar__label ${digit === lastDigit ? 'digit-bar__label--active' : ''}`}>
                                {digit}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
