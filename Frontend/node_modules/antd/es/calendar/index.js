"use client";

import dayjsGenerateConfig from '@rc-component/picker/generate/dayjs';
import generateCalendar from './generateCalendar';
const Calendar = generateCalendar(dayjsGenerateConfig);
Calendar.generateCalendar = generateCalendar;
export default Calendar;