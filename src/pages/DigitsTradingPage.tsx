import React, { useState, useEffect, useCallback } from 'react';
import { DigitFrequencyBar }     from '../components/digits/DigitFrequencyBar';
import { TickTape }              from '../components/digits/TickTape';
import { ContractTypeSelector, CONTRACT_TYPES } from '../components/digits/ContractTypeSelector';
import { DigitPicker }           from '../components/digits/DigitPicker';
import { SymbolSelector }        from '../components/digits/SymbolSelector';
import { TradeResult }           from '../components/digits/TradeResult';
import { useTickStream }         from '../hooks/digits/useTickStream';
import { useDigitTrade, type DigitContractType } from '../hooks/digits/useDigitTrade';
import { useSymbols }            from '../hooks/digits/useSymbols';
import './DigitsTradingPage.scss';

const APP_ID = (import.meta as unknown as { env: Record<string, string> })
    .env?.NEXT_PUBLIC_DERIV_APP_ID ?? '1089';

const NEEDS_PREDICTION: DigitContractType[] = ['DIGITMATCH','DIGITDIFF','DIGITOVER','DIGITUNDER'];

export const DigitsTradingPage: React.FC = () => {
    const { symbols, defaultSymbol } = useSymbols();
    const [symbol, setSymbol]               = useState(defaultSymbol);
    const [contractType, setContractType]   = useState<DigitContractType>('DIGITMATCH');
    const [prediction, setPrediction]       = useState(5);
    const [stake, setStake]                 = useState(1);
    const [duration, setDuration]           = useState(1);
    const [token, setToken]                 = useState('');
    const [showToken, setShowToken]         = useState(false);

    const { ticks, lastTick, digitFrequency, isStreaming, startStream, stopStream } = useTickStream(APP_ID);
    const { buyContract, lastResult, isTrading, error, clearError } = useDigitTrade(APP_ID);

    useEffect(() => {
        startStream(symbol);
        return () => stopStream();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [symbol]);

    const hasPrediction = NEEDS_PREDICTION.includes(contractType);

    const winDigits: number[] = [];
    if (contractType === 'DIGITOVER')  for (let d = prediction + 1; d <= 9; d++) winDigits.push(d);
    if (contractType === 'DIGITUNDER') for (let d = 0; d < prediction; d++) winDigits.push(d);
    if (contractType === 'DIGITMATCH') winDigits.push(prediction);
    if (contractType === 'DIGITDIFF')  [0,1,2,3,4,5,6,7,8,9].filter(d => d !== prediction).forEach(d => winDigits.push(d));
    if (contractType === 'DIGITEVEN')  [0,2,4,6,8].forEach(d => winDigits.push(d));
    if (contractType === 'DIGITODD')   [1,3,5,7,9].forEach(d => winDigits.push(d));

    const handleTrade = useCallback(() => {
        if (!token) { setShowToken(true); return; }
        buyContract({ contractType, symbol, stake, duration, prediction: hasPrediction ? prediction : undefined, token });
    }, [token, buyContract, contractType, symbol, stake, duration, hasPrediction, prediction]);

    const ctLabel = CONTRACT_TYPES.find(c => c.type === contractType)?.label ?? contractType;
    const lastDigitIsWin = lastTick !== null && winDigits.includes(lastTick.digit);

    return (
        <div className='digits-trading-page'>
            <div className='digits-trading-page__header'>
                <h2 className='digits-trading-page__title'>Digits Trading</h2>
                <div className='digits-trading-page__status'>
                    <span className={`stream-dot ${isStreaming ? 'stream-dot--live' : ''}`} />
                    <span>{isStreaming ? 'Live' : 'Connecting…'}</span>
                </div>
            </div>

            <div className='digits-trading-page__layout'>
                {/* ── Left: analytics ── */}
                <div className='digits-trading-page__charts'>
                    <SymbolSelector symbols={symbols} selected={symbol} onChange={setSymbol} />

                    {lastTick && (
                        <div className='digits-price'>
                            <span className='digits-price__quote'>{lastTick.quote.toFixed(3)}</span>
                            <span className={`digits-price__digit ${lastDigitIsWin ? 'digits-price__digit--win' : ''}`}>
                                Last digit: {lastTick.digit}
                            </span>
                        </div>
                    )}

                    <TickTape
                        ticks={ticks}
                        lastDigit={lastTick?.digit ?? null}
                        prediction={hasPrediction ? prediction : undefined}
                        contractType={contractType}
                    />

                    <DigitFrequencyBar
                        ticks={ticks}
                        digitFrequency={digitFrequency}
                        lastDigit={lastTick?.digit ?? null}
                        prediction={hasPrediction ? prediction : undefined}
                        contractType={contractType}
                    />
                </div>

                {/* ── Right: trade panel ── */}
                <div className='digits-trading-page__panel'>
                    <ContractTypeSelector selected={contractType} onChange={ct => { setContractType(ct); clearError(); }} />

                    {hasPrediction && (
                        <DigitPicker value={prediction} onChange={setPrediction} contractType={contractType} winDigits={winDigits} />
                    )}

                    <div>
                        <div className='trade-label'>Duration (Ticks)</div>
                        <div className='duration-row'>
                            {[1,2,3,4,5].map(d => (
                                <button key={d} type='button'
                                    className={`duration-btn ${d === duration ? 'duration-btn--active' : ''}`}
                                    onClick={() => setDuration(d)}>{d}t</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className='trade-label'>Stake (USD)</div>
                        <div className='stake-row'>
                            <button type='button' className='stake-adj' onClick={() => setStake(s => Math.max(0.35, +(s - 0.5).toFixed(2)))}>−</button>
                            <input type='number' className='stake-input' min={0.35} step={0.5} value={stake}
                                onChange={e => setStake(Math.max(0.35, +e.target.value))} />
                            <button type='button' className='stake-adj' onClick={() => setStake(s => +(s + 0.5).toFixed(2))}>+</button>
                        </div>
                    </div>

                    {showToken && (
                        <div>
                            <div className='trade-label'>API Token</div>
                            <input type='password' className='token-input' placeholder='Paste your Deriv API token'
                                value={token} onChange={e => setToken(e.target.value)} />
                            <p className='token-hint'>
                                Get it at <a href='https://app.deriv.com/account/api-token' target='_blank' rel='noreferrer'>
                                app.deriv.com/account/api-token</a> with <strong>Trade</strong> scope.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className='digits-error'>
                            <span>{error}</span>
                            <button type='button' onClick={clearError}>✕</button>
                        </div>
                    )}

                    <button type='button' className='buy-btn' onClick={handleTrade} disabled={isTrading}>
                        {isTrading ? 'Trading…' : `Buy ${ctLabel}`}
                    </button>

                    {lastResult?.status === 'pending' && (
                        <div className='trade-pending'>
                            <div className='trade-pending__spinner' />
                            <span>Contract #{lastResult.contractId} running…</span>
                        </div>
                    )}
                </div>
            </div>

            <TradeResult result={lastResult} onClose={() => {}} />
        </div>
    );
};
