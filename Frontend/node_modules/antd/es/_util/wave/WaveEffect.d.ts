import type { WaveProps } from '.';
import type { ShowWaveEffect } from './interface';
export interface WaveEffectProps {
    className: string;
    target: HTMLElement;
    component?: string;
    colorSource?: WaveProps['colorSource'];
}
declare const showWaveEffect: ShowWaveEffect;
export default showWaveEffect;
