import * as React from 'react';
import type { KeyWiseTransferItem, TransferSemanticClassNames, TransferSemanticStyles } from '.';
type ListItemProps<RecordType> = {
    prefixCls: string;
    classNames: TransferSemanticClassNames;
    styles: TransferSemanticStyles;
    renderedText?: string | number;
    renderedEl: React.ReactNode;
    disabled?: boolean;
    checked?: boolean;
    onClick: (item: RecordType, e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
    onRemove?: (item: RecordType) => void;
    item: RecordType;
    showRemove?: boolean;
};
declare const _default: React.MemoExoticComponent<(<RecordType extends KeyWiseTransferItem>(props: ListItemProps<RecordType>) => React.JSX.Element)>;
export default _default;
