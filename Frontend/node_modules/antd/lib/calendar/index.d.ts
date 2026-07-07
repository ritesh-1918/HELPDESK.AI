import type { Dayjs } from 'dayjs';
import generateCalendar from './generateCalendar';
export type { CalendarMode, CalendarProps, CalendarSemanticClassNames, CalendarSemanticName, CalendarSemanticStyles, } from './generateCalendar';
declare const Calendar: import("react").FC<Readonly<import("./generateCalendar").CalendarProps<Dayjs>>>;
export type CalendarType = typeof Calendar & {
    generateCalendar: typeof generateCalendar;
};
declare const _default: CalendarType;
export default _default;
