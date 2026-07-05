import type { ScreenMap } from '../../_util/responsiveObserver';
import type { RowProps } from '../row';
export type Gap = number | string | undefined;
export default function useGutter(gutter: RowProps['gutter'], screens: ScreenMap | null): [Gap, Gap];
