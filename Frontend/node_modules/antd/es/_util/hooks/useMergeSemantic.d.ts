import * as React from 'react';
import type { AnyObject, EmptyObject, ValidChar } from '../type';
export type SemanticSchema = {
    _default?: string;
} & {
    [key: `${ValidChar}${string}`]: SemanticSchema;
};
export type Resolvable<T, P extends AnyObject> = T | ((info: {
    props: P;
}) => T);
export type SemanticClassNamesType<Props extends AnyObject, SemanticClassNames extends Record<PropertyKey, string>, NestedStructure extends EmptyObject = EmptyObject> = Resolvable<Readonly<SemanticClassNames>, Props> & NestedStructure;
export type SemanticStylesType<Props extends AnyObject, SemanticStyles extends Record<PropertyKey, React.CSSProperties>, NestedStructure extends EmptyObject = EmptyObject> = Resolvable<Readonly<SemanticStyles>, Props> & NestedStructure;
export type SemanticType<P = any, T = any> = T | ((info: {
    props: P;
}) => T);
export declare const mergeClassNames: <Name extends string, SemanticClassNames extends Partial<Record<Name, any>>>(schema?: SemanticSchema, ...classNames: (SemanticClassNames | undefined)[]) => SemanticClassNames;
export declare const mergeStyles: <StylesType extends AnyObject>(...styles: (Partial<StylesType> | undefined)[]) => Record<PropertyKey, React.CSSProperties>;
export declare const resolveStyleOrClass: <T extends AnyObject>(value: T | ((config: any) => T), info: {
    props: AnyObject;
}) => T;
type MaybeFn<T, P> = T | ((info: {
    props: P;
}) => T) | undefined;
type ObjectOnly<T> = T extends (...args: any) => any ? never : T;
/**
 * @desc Merge classNames and styles from multiple sources. When `schema` is provided, it **must** provide the nest object structure.
 * @descZH 合并来自多个来源的 classNames 和 styles，当提供了 `schema` 时，必须提供嵌套的对象结构。
 */
export declare const useMergeSemantic: <ClassNamesType extends AnyObject, StylesType extends AnyObject, Props extends AnyObject>(classNamesList: MaybeFn<ClassNamesType, Props>[], stylesList: MaybeFn<StylesType, Props>[], info: {
    props: Props;
}, schema?: SemanticSchema) => readonly [ObjectOnly<ClassNamesType>, ObjectOnly<StylesType>];
export {};
