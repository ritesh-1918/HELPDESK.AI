import * as React from 'react';
import type { WaveProps } from '.';
import type { ShowWave, WaveComponent } from './interface';
declare const useWave: (nodeRef: React.RefObject<HTMLElement | null>, className: string, component?: WaveComponent, colorSource?: WaveProps["colorSource"]) => ShowWave;
export default useWave;
