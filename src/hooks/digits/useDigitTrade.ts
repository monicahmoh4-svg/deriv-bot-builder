import { useState, useEffect, useCallback } from 'react';
import { useDerivWebSocket } from './useDerivWebSocket';

export type DigitContractType =
    | 'DIGITMATCH' | 'DIGITDIFF'
    | 'DIGITOVER'  | 'DIGITUNDER'
    | 'DIGITEVEN'  | 'DIGITODD';

export interface TradeParams {
    contractType: DigitContractType;
    symbol: string;
    stake: number;
    duration: number;
    prediction?: number;
    token: string;
}

export interface ContractResult {
    contractId: number;
    buyPrice: number;
    payout: number;
    profit?: number;
    status?: 'won' | 'lost' | 'pending';
    exitDigit?: number;
}

export function useDigitTrade(appId: string) {
    const { send, subscribe } = useDerivWebSocket(appId);
    const [lastResult, setLastResult] = useState<ContractResult | null>(null);
    const [isTrading, setIsTrading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    const buyContract = useCallback((params: TradeParams) => {
        setIsTrading(true);
        setError(null);
        send({ authorize: params.token });

        const unsubAuth = subscribe('authorize', (authData) => {
            if ((authData.error as { message?: string } | undefined)?.message) {
                setError('Authorization failed. Check your API token.');
                setIsTrading(false);
                unsubAuth();
                return;
            }
            unsubAuth();
            send({
                buy: 1,
                price: params.stake,
                parameters: {
                    contract_type: params.contractType,
                    currency: 'USD',
                    duration: params.duration,
                    duration_unit: 't',
                    symbol: params.symbol,
                    basis: 'stake',
                    amount: params.stake,
                    ...(params.prediction !== undefined && { barrier: String(params.prediction) }),
                },
            });
        });
    }, [send, subscribe]);

    useEffect(() => {
        const unsubBuy = subscribe('buy', (data) => {
            const err = data.error as { message: string } | undefined;
            if (err) { setError(err.message); setIsTrading(false); return; }
            const buyData = data.buy as { contract_id: number; buy_price: number; payout: number };
            setLastResult({ contractId: buyData.contract_id, buyPrice: buyData.buy_price, payout: buyData.payout, status: 'pending' });
            send({ proposal_open_contract: 1, contract_id: buyData.contract_id, subscribe: 1 });
        });

        const unsubPOC = subscribe('proposal_open_contract', (data) => {
            const poc = data.proposal_open_contract as {
                profit: number; exit_tick: number; is_sold: number; is_settleable: number;
            } | undefined;
            if (!poc || (!poc.is_sold && !poc.is_settleable)) return;
            const exitStr = poc.exit_tick?.toString() ?? '';
            setLastResult(prev => prev ? {
                ...prev,
                profit: poc.profit,
                status: poc.profit >= 0 ? 'won' : 'lost',
                exitDigit: parseInt(exitStr[exitStr.length - 1], 10),
            } : null);
            setIsTrading(false);
        });

        return () => { unsubBuy(); unsubPOC(); };
    }, [subscribe, send]);

    return { buyContract, lastResult, isTrading, error, clearError };
}
