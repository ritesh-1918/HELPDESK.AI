import * as React from 'react';
import type { GenerateConfig } from '@rc-component/picker/generate';
import type { Locale } from '@rc-component/picker/interface';
import type { CalendarMode, SelectInfo } from './generateCalendar';
export interface CalendarHeaderProps<DateType> {
    className?: string;
    style?: React.CSSProperties;
    prefixCls: string;
    value: DateType;
    validRange?: [DateType, DateType];
    generateConfig: GenerateConfig<DateType>;
    locale: Locale;
    mode: CalendarMode;
    fullscreen: boolean;
    onChange: (date: DateType, source: SelectInfo['source']) => void;
    onModeChange: (mode: CalendarMode) => void;
}
declare function CalendarHeader<DateType>(props: CalendarHeaderProps<DateType>): React.JSX.Element;
export default CalendarHeader;
