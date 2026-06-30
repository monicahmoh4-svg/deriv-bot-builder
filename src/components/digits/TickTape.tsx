import React, { useRef, useEffect } from 'react';
import type { Tick } from '../../hooks/digits/useTickStream';
import './TickTape.scss';

interface Props {
    ticks: Tick[];
    lastDigit: number | null;
    prediction?: number | null;
    contractType?: string;
}

function getTickClass(digit: number, isLast: boolean, prediction?: number | null, contractType?: string) {
    if (isLast) return 'tick-cell--last';
    if (prediction == null) return '';
    if (contractType === 'DIGITMATCH' && digit === prediction) return 'tick-cell--match';
    if (contractType === 'DIGITDIFF'  && digit !== prediction) return 'tick-cell--win';
    if (contractType === 'DIGITOVER'  && digit >  prediction)  return 'tick-cell--win';
    if (contractType === 'DIGITUNDER' && digit <  prediction)  return 'tick-cell--win';
    if (contractType === 'DIGITEVEN'  && digit % 2 === 0)      return 'tick-cell--win';
    if (contractType === 'DIGITODD'   && digit % 2 !== 0)      return 'tick-cell--win';
    return '';
}

export const TickTape: React.FC<Props> = ({ ticks, lastDigit, prediction, contractType }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.scrollLeft = ref.current.scrollWidth;
    }, [ticks]);

    return (
        <div className='tick-tape'>
            <span className='tick-tape__label'>Last Digits</span>
            <div className='tick-tape__scroll' ref={ref}>
                <div className='tick-tape__inner'>
                    {ticks.map((tick, i) => {
                        const isLast = i === ticks.length - 1;
                        return (
                            <div
                                key={tick.epoch}
                                className={`tick-cell ${getTickClass(tick.digit, isLast, prediction, contractType)} ${isLast ? 'tick-cell--animate' : ''}`}
                            >
                                {tick.digit}
                            </div>
                        );
                    })}
                </div>
            </div>
            {lastDigit !== null && (
                <div className='tick-tape__current'>
                    <span className='tick-tape__current-label'>Now</span>
                    <span className='tick-tape__current-digit'>{lastDigit}</span>
                </div>
            )}
        </div>
    );
};
