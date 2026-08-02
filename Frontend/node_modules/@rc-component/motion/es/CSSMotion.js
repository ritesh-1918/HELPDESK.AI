/* eslint-disable react/default-props-match-prop-types, react/no-multi-comp, react/prop-types */
import { getDOM } from "@rc-component/util/es/Dom/findDOMNode";
import { getNodeRef, supportRef } from "@rc-component/util/es/ref";
import { clsx } from 'clsx';
import * as React from 'react';
import { useRef } from 'react';
import { Context } from "./context";
import useStatus from "./hooks/useStatus";
import { isActive } from "./hooks/useStepQueue";
import { STATUS_NONE, STEP_PREPARE, STEP_START } from "./interface";
import { getTransitionName, supportTransition } from "./util/motion";
/**
 * `transitionSupport` is used for none transition test case.
 * Default we use browser transition event support check.
 */
export function genCSSMotion(config) {
  let transitionSupport = config;
  if (typeof config === 'object') {
    ({
      transitionSupport
    } = config);
  }
  function isSupportTransition(props, contextMotion) {
    return !!(props.motionName && transitionSupport && contextMotion !== false);
  }
  const CSSMotion = /*#__PURE__*/React.forwardRef((props, ref) => {
    const {
      // Default config
      visible = true,
      removeOnLeave = true,
      forceRender,
      children,
      motionName,
      leavedClassName,
      eventProps
    } = props;
    const {
      motion: contextMotion
    } = React.useContext(Context);
    const supportMotion = isSupportTransition(props, contextMotion);

    // Ref to the react node, it may be a HTMLElement
    const nodeRef = useRef();
    function getDomElement() {
      return getDOM(nodeRef.current);
    }
    const [getStatus, statusStep, statusStyle, mergedVisible] = useStatus(supportMotion, visible, getDomElement, props);
    const status = getStatus();

    // Record whether content has rendered
    // Will return null for un-rendered even when `removeOnLeave={false}`
    const renderedRef = React.useRef(mergedVisible);
    if (mergedVisible) {
      renderedRef.current = true;
    }

    // ====================== Refs ======================
    const refObj = React.useMemo(() => {
      const obj = {};
      Object.defineProperties(obj, {
        nativeElement: {
          enumerable: true,
          get: getDomElement
        },
        inMotion: {
          enumerable: true,
          get: () => () => getStatus() !== STATUS_NONE
        },
        enableMotion: {
          enumerable: true,
          get: () => () => supportMotion
        }
      });
      return obj;
    }, []);

    // We lock `deps` here since function return object
    // will repeat trigger ref from `refConfig` -> `null` -> `refConfig`
    React.useImperativeHandle(ref, () => refObj, []);

    // ===================== Render =====================
    let motionChildren;
    const mergedProps = {
      ...eventProps,
      visible
    };
    if (!children) {
      // No children
      motionChildren = null;
    } else if (status === STATUS_NONE) {
      // Stable children
      if (mergedVisible) {
        motionChildren = children({
          ...mergedProps
        }, nodeRef);
      } else if (!removeOnLeave && renderedRef.current && leavedClassName) {
        motionChildren = children({
          ...mergedProps,
          className: leavedClassName
        }, nodeRef);
      } else if (forceRender || !removeOnLeave && !leavedClassName) {
        motionChildren = children({
          ...mergedProps,
          style: {
            display: 'none'
          }
        }, nodeRef);
      } else {
        motionChildren = null;
      }
    } else {
      // In motion
      let statusSuffix;
      if (statusStep === STEP_PREPARE) {
        statusSuffix = 'prepare';
      } else if (isActive(statusStep)) {
        statusSuffix = 'active';
      } else if (statusStep === STEP_START) {
        statusSuffix = 'start';
      }
      const motionCls = getTransitionName(motionName, `${status}-${statusSuffix}`);
      motionChildren = children({
        ...mergedProps,
        className: clsx(getTransitionName(motionName, status), {
          [motionCls]: motionCls && statusSuffix,
          [motionName]: typeof motionName === 'string'
        }),
        style: statusStyle
      }, nodeRef);
    }

    // Auto inject ref if child node not have `ref` props
    if ( /*#__PURE__*/React.isValidElement(motionChildren) && supportRef(motionChildren)) {
      const originNodeRef = getNodeRef(motionChildren);
      if (!originNodeRef) {
        motionChildren = /*#__PURE__*/React.cloneElement(motionChildren, {
          ref: nodeRef
        });
      }
    }
    return motionChildren;
  });
  CSSMotion.displayName = 'CSSMotion';
  return CSSMotion;
}
export default genCSSMotion(supportTransition);