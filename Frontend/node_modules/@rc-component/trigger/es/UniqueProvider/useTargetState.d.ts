import type { UniqueShowOptions } from '../context';
/**
 * Control the state of popup bind target:
 * 1. When set `target`. Do show the popup.
 * 2. When `target` is removed. Do hide the popup.
 * 3. When `target` change to another one:
 *  a. We wait motion finish of previous popup.
 *  b. Then we set new target and show the popup.
 * 4. During appear/enter animation, cache new options and apply after animation completes.
 */
export default function useTargetState(): [
    trigger: (options: UniqueShowOptions | false) => void,
    open: boolean,
    cacheOptions: UniqueShowOptions | null,
    onVisibleChanged: (visible: boolean) => void
];
