import { useControlledState } from '@rc-component/util';
import { useMemo } from 'react';
import { generateColor } from "../util";
const useColorState = (defaultValue, value) => {
  const [mergedValue, setValue] = useControlledState(defaultValue, value);
  const color = useMemo(() => generateColor(mergedValue), [mergedValue]);
  return [color, setValue];
};
export default useColorState;