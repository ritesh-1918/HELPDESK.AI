import type { WaveProps } from '.';
import type { GlobalToken } from '../../theme/internal';
export declare const TARGET_CLS = "ant-wave-target";
export type ShowWaveEffect = (element: HTMLElement, info: {
    className: string;
    token: GlobalToken;
    component?: WaveComponent;
    event: MouseEvent;
    hashId: string;
    colorSource?: WaveProps['colorSource'];
}) => void;
export type ShowWave = (event: MouseEvent) => void;
export type WaveComponent = 'Tag' | 'Button' | 'Checkbox' | 'Radio' | 'Switch' | 'Steps';
