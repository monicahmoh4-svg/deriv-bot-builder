export interface SymbolInfo {
    symbol: string;
    display_name: string;
}

export const DIGITS_SYMBOLS: SymbolInfo[] = [
    { symbol: '1HZ10V',  display_name: 'Volatility 10 (1s) Index'  },
    { symbol: '1HZ25V',  display_name: 'Volatility 25 (1s) Index'  },
    { symbol: '1HZ50V',  display_name: 'Volatility 50 (1s) Index'  },
    { symbol: '1HZ75V',  display_name: 'Volatility 75 (1s) Index'  },
    { symbol: '1HZ100V', display_name: 'Volatility 100 (1s) Index' },
    { symbol: 'R_10',    display_name: 'Volatility 10 Index'        },
    { symbol: 'R_25',    display_name: 'Volatility 25 Index'        },
    { symbol: 'R_50',    display_name: 'Volatility 50 Index'        },
    { symbol: 'R_75',    display_name: 'Volatility 75 Index'        },
    { symbol: 'R_100',   display_name: 'Volatility 100 Index'       },
];

export function useSymbols() {
    return { symbols: DIGITS_SYMBOLS, defaultSymbol: '1HZ100V' };
}
