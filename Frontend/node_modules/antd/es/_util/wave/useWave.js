import * as React from 'react';
import { useEvent } from '@rc-component/util';
import raf from "@rc-component/util/es/raf";
import { ConfigContext } from '../../config-provider';
import useToken from '../../theme/useToken';
import { TARGET_CLS } from './interface';
import showWaveEffect from './WaveEffect';
const useWave = (nodeRef, className, component, colorSource) => {
  const {
    wave
  } = React.useContext(ConfigContext);
  const [, token, hashId] = useToken();
  const showWave = useEvent(event => {
    const node = nodeRef.current;
    if (wave?.disabled || !node) {
      return;
    }
    const targetNode = node.querySelector(`.${TARGET_CLS}`) || node;
    const {
      showEffect
    } = wave || {};
    // Customize wave effect
    (showEffect || showWaveEffect)(targetNode, {
      className,
      token,
      component,
      event,
      hashId,
      colorSource
    });
  });
  const rafId = React.useRef(null);
  // Clean up RAF on unmount to prevent memory leaks and stale callbacks
  React.useEffect(() => () => {
    raf.cancel(rafId.current);
  }, []);
  // Merge trigger event into one for each frame
  const showDebounceWave = event => {
    raf.cancel(rafId.current);
    rafId.current = raf(() => {
      showWave(event);
    });
  };
  return showDebounceWave;
};
export default useWave;