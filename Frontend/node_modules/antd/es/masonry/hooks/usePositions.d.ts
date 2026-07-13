import type { Key } from 'react';
export type ItemHeightData = [key: Key, height: number, column?: number];
export type ItemPositions = Map<Key, {
    column: number;
    top: number;
}>;
/**
 * Auto arrange the items in the masonry layout.
 * Always get stable positions by order
 * instead of dynamic adjust for next item height.
 */
export default function usePositions(itemHeights: ItemHeightData[], columnCount: number, verticalGutter: number): readonly [ItemPositions, number];
