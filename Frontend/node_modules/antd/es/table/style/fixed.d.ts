import type { CSSObject } from '@ant-design/cssinjs';
import type { GenerateStyle } from '../../theme/internal';
import type { TableToken } from './index';
export declare function getShadowStyle({ colorSplit: shadowColor, }: Pick<TableToken, 'colorSplit'>): [left: CSSObject, right: CSSObject];
declare const genFixedStyle: GenerateStyle<TableToken, CSSObject>;
export default genFixedStyle;
