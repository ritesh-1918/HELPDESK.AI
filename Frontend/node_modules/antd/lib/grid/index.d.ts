import Col from './col';
import Row from './row';
declare function useBreakpoint(): Partial<Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl", boolean>>;
export type { ColProps, ColSize } from './col';
export type { RowProps } from './row';
export { Col, Row };
declare const _default: {
    useBreakpoint: typeof useBreakpoint;
};
export default _default;
