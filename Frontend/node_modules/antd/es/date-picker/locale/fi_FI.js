import CalendarLocale from '@rc-component/picker/locale/fi_FI';
import TimePickerLocale from '../../time-picker/locale/fi_FI';
// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Valitse päivä',
    rangePlaceholder: ['Alkamispäivä', 'Päättymispäivä'],
    ...CalendarLocale
  },
  timePickerLocale: {
    ...TimePickerLocale
  }
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
export default locale;