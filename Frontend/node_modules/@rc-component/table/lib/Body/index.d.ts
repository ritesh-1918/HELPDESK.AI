import * as React from 'react';
export interface BodyProps<RecordType> {
    data: readonly RecordType[];
    measureColumnWidth: boolean;
}
declare const _default: {
    <RecordType>(props: BodyProps<RecordType>): React.JSX.Element;
    displayName: string;
};
export default _default;
