import CalendarLocale from '@rc-component/picker/locale/lt_LT';
import TimePickerLocale from '../../time-picker/locale/lt_LT';
// Merge into a locale object
const locale = {
  lang: {
    placeholder: 'Pasirinkite datą',
    yearPlaceholder: 'Pasirinkite metus',
    quarterPlaceholder: 'Pasirinkite ketvirtį',
    monthPlaceholder: 'Pasirinkite mėnesį',
    weekPlaceholder: 'Pasirinkite savaitę',
    rangePlaceholder: ['Pradžios data', 'Pabaigos data'],
    rangeYearPlaceholder: ['Pradžios metai', 'Pabaigos metai'],
    rangeQuarterPlaceholder: ['Pradžios ketvirtis', 'Pabaigos ketvirtis'],
    rangeMonthPlaceholder: ['Pradžios mėnesis', 'Pabaigos mėnesis'],
    rangeWeekPlaceholder: ['Pradžios savaitė', 'Pabaigos savaitė'],
    ...CalendarLocale
  },
  timePickerLocale: {
    ...TimePickerLocale
  }
};
// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json
export default locale;