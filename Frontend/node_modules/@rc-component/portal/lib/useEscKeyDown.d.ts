import { type EscCallback } from './Portal';
export declare const _test: () => {
    stack: {
        id: string;
        onEsc?: EscCallback;
    }[];
    reset: () => void;
};
export default function useEscKeyDown(open: boolean, onEsc?: EscCallback): void;
