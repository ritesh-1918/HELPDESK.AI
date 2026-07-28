export declare const macroTask: (fn: VoidFunction, times?: number) => void;
/**
 * Trigger by latest open call, if nextOpen is undefined, means toggle.
 * `weak` means this call can be ignored if previous call exists.
 */
export type TriggerOpenType = (nextOpen?: boolean, config?: {
    cancelFun?: () => boolean;
}) => void;
/**
 * When `open` is controlled, follow the controlled value;
 * Otherwise use uncontrolled logic.
 * Setting `open` takes effect immediately,
 * but setting it to `false` is delayed via MessageChannel.
 *
 * SSR handling: During SSR, `open` is always false to avoid Portal issues.
 * On client-side hydration, it syncs with the actual open state.
 */
export default function useOpen(defaultOpen: boolean, propOpen: boolean, onOpen: (nextOpen: boolean) => void, postOpen: (nextOpen: boolean) => boolean): [rawOpen: boolean, open: boolean, toggleOpen: TriggerOpenType, lockOptions: boolean];
