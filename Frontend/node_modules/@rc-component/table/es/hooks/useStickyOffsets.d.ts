import type { ColumnType, StickyOffsets } from '../interface';
/**
 * Get sticky column offset width
 */
declare function useStickyOffsets<RecordType>(colWidths: number[], flattenColumns: readonly ColumnType<RecordType>[]): StickyOffsets;
export default useStickyOffsets;
