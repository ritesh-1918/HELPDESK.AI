import type { ColumnType, StickyOffsets } from '../interface';
export default function useFixedInfo<RecordType>(flattenColumns: readonly ColumnType<RecordType>[], stickyOffsets: StickyOffsets): import("../utils/fixUtil").FixedInfo[];
