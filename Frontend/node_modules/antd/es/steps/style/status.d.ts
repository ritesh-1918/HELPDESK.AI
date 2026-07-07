import type { CSSObject } from '@ant-design/cssinjs';
import type { StepsToken } from '.';
import type { GenerateStyle } from '../../theme/internal';
export declare const STATUS_WAIT = "wait";
export declare const STATUS_PROCESS = "process";
export declare const STATUS_FINISH = "finish";
export declare const STATUS_ERROR = "error";
declare const genStatusStyle: GenerateStyle<StepsToken, CSSObject>;
export default genStatusStyle;
