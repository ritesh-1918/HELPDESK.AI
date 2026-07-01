export declare const responsiveArray: readonly ["xxxl", "xxl", "xl", "lg", "md", "sm", "xs"];
export declare const responsiveArrayReversed: ("xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl")[];
export type Breakpoint = (typeof responsiveArray)[number];
export type BreakpointMap = Record<Breakpoint, string>;
export type ScreenMap = Partial<Record<Breakpoint, boolean>>;
export type ScreenSizeMap = Partial<Record<Breakpoint, number>>;
type SubscribeFunc = (screens: ScreenMap) => void;
export declare const matchScreen: (screens: ScreenMap, screenSizes?: ScreenSizeMap) => number | undefined;
interface ResponsiveObserverType {
    responsiveMap: BreakpointMap;
    dispatch: (map: ScreenMap) => boolean;
    subscribe: (func: SubscribeFunc) => number;
    unsubscribe: (token: number) => void;
    register: () => void;
    unregister: () => void;
    matchHandlers: Record<PropertyKey, {
        mql: MediaQueryList;
        listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void;
    }>;
}
declare const useResponsiveObserver: () => ResponsiveObserverType;
export default useResponsiveObserver;
