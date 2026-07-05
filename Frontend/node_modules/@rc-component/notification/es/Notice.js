function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { clsx } from 'clsx';
import KeyCode from "@rc-component/util/es/KeyCode";
import * as React from 'react';
import pickAttrs from "@rc-component/util/es/pickAttrs";
const Notify = /*#__PURE__*/React.forwardRef((props, ref) => {
  const {
    prefixCls,
    style,
    className,
    duration = 4.5,
    showProgress,
    pauseOnHover = true,
    eventKey,
    content,
    closable,
    props: divProps,
    onClick,
    onNoticeClose,
    times,
    hovering: forcedHovering
  } = props;
  const [hovering, setHovering] = React.useState(false);
  const [percent, setPercent] = React.useState(0);
  const [spentTime, setSpentTime] = React.useState(0);
  const mergedHovering = forcedHovering || hovering;
  const mergedDuration = typeof duration === 'number' ? duration : 0;
  const mergedShowProgress = mergedDuration > 0 && showProgress;

  // ======================== Close =========================
  const onInternalClose = () => {
    onNoticeClose(eventKey);
  };
  const onCloseKeyDown = e => {
    if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === KeyCode.ENTER) {
      onInternalClose();
    }
  };

  // ======================== Effect ========================
  React.useEffect(() => {
    if (!mergedHovering && mergedDuration > 0) {
      const start = Date.now() - spentTime;
      const timeout = setTimeout(() => {
        onInternalClose();
      }, mergedDuration * 1000 - spentTime);
      return () => {
        if (pauseOnHover) {
          clearTimeout(timeout);
        }
        setSpentTime(Date.now() - start);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedDuration, mergedHovering, times]);
  React.useEffect(() => {
    if (!mergedHovering && mergedShowProgress && (pauseOnHover || spentTime === 0)) {
      const start = performance.now();
      let animationFrame;
      const calculate = () => {
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(timestamp => {
          const runtime = timestamp + spentTime - start;
          const progress = Math.min(runtime / (mergedDuration * 1000), 1);
          setPercent(progress * 100);
          if (progress < 1) {
            calculate();
          }
        });
      };
      calculate();
      return () => {
        if (pauseOnHover) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedDuration, spentTime, mergedHovering, mergedShowProgress, times]);

  // ======================== Closable ========================
  const closableObj = React.useMemo(() => {
    if (typeof closable === 'object' && closable !== null) {
      return closable;
    }
    return {};
  }, [closable]);
  const ariaProps = pickAttrs(closableObj, true);

  // ======================== Progress ========================
  const validPercent = 100 - (!percent || percent < 0 ? 0 : percent > 100 ? 100 : percent);

  // ======================== Render ========================
  const noticePrefixCls = `${prefixCls}-notice`;
  return /*#__PURE__*/React.createElement("div", _extends({}, divProps, {
    ref: ref,
    className: clsx(noticePrefixCls, className, {
      [`${noticePrefixCls}-closable`]: closable
    }),
    style: style,
    onMouseEnter: e => {
      setHovering(true);
      divProps?.onMouseEnter?.(e);
    },
    onMouseLeave: e => {
      setHovering(false);
      divProps?.onMouseLeave?.(e);
    },
    onClick: onClick
  }), /*#__PURE__*/React.createElement("div", {
    className: `${noticePrefixCls}-content`
  }, content), closable && /*#__PURE__*/React.createElement("button", _extends({
    className: `${noticePrefixCls}-close`,
    onKeyDown: onCloseKeyDown,
    "aria-label": "Close"
  }, ariaProps, {
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      onInternalClose();
    }
  }), closableObj.closeIcon ?? 'x'), mergedShowProgress && /*#__PURE__*/React.createElement("progress", {
    className: `${noticePrefixCls}-progress`,
    max: "100",
    value: validPercent
  }, validPercent + '%'));
});
export default Notify;