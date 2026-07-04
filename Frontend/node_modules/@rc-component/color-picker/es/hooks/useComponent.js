import * as React from 'react';
import Slider from "../components/Slider";
export default function useComponent(components) {
  return React.useMemo(() => {
    const {
      slider
    } = components || {};
    return [slider || Slider];
  }, [components]);
}