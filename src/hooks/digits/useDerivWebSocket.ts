import { useEffect, useRef, useCallback, useState } from 'react';

type MessageHandler = (data: Record<string, unknown>) => void;

interface UseDerivWebSocketReturn {
    send: (msg: Record<string, unknown>) => void;
    isConnected: boolean;
    subscribe: (type: string, handler: MessageHandler) => () => void;
}

const WS_URL = (appId: string) =>
    `wss://ws.derivws.com/websockets/v3?app_id=${appId}&l=EN&brand=deriv`;

let socketInstance: WebSocket | null = null;
let socketAppId = '';
const listeners: Map<string, Set<MessageHandler>> = new Map();
let connectedCallbacks: Array<() => void> = [];

function getOrCreateSocket(appId: string): WebSocket {
    if (socketInstance && socketInstance.readyState < 2 && socketAppId === appId) {
        return socketInstance;
    }
    socketInstance = new WebSocket(WS_URL(appId));
    socketAppId = appId;

    socketInstance.onopen = () => {
        connectedCallbacks.forEach(cb => cb());
        connectedCallbacks = [];
    };

    socketInstance.onmessage = (evt: MessageEvent) => {
        try {
            const data = JSON.parse(evt.data as string) as Record<string, unknown>;
            const msgType = data.msg_type as string;
            const handlers = listeners.get(msgType);
            if (handlers) handlers.forEach(h => h(data));
            const allHandlers = listeners.get('*');
            if (allHandlers) allHandlers.forEach(h => h(data));
        } catch { /* ignore parse errors */ }
    };

    socketInstance.onerror = () => {};
    socketInstance.onclose = () => { socketInstance = null; };
    return socketInstance;
}

export function useDerivWebSocket(appId: string): UseDerivWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const appIdRef = useRef(appId);

    useEffect(() => {
        appIdRef.current = appId;
        const ws = getOrCreateSocket(appId);
        const check = () => setIsConnected(ws.readyState === WebSocket.OPEN);
        if (ws.readyState === WebSocket.OPEN) setIsConnected(true);
        else connectedCallbacks.push(check);
        const interval = setInterval(check, 1000);
        return () => clearInterval(interval);
    }, [appId]);

    const send = useCallback((msg: Record<string, unknown>) => {
        const ws = getOrCreateSocket(appIdRef.current);
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
        else connectedCallbacks.push(() => ws.send(JSON.stringify(msg)));
    }, []);

    const subscribe = useCallback((type: string, handler: MessageHandler) => {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(handler);
        return () => { listeners.get(type)?.delete(handler); };
    }, []);

    return { send, isConnected, subscribe };
}
