import type { FullToken, GenerateStyle } from '../../theme/internal';
export interface ComponentToken {
}
export interface MasonryToken extends FullToken<'Masonry'> {
}
export declare const genMasonryStyle: GenerateStyle<MasonryToken>;
declare const _default: (prefixCls: string, rootCls?: string) => readonly [string, string];
export default _default;
