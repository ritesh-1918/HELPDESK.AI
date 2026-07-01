"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = useDom;
var React = _interopRequireWildcard(require("react"));
var _useLayoutEffect = _interopRequireDefault(require("@rc-component/util/lib/hooks/useLayoutEffect"));
var _canUseDom = _interopRequireDefault(require("@rc-component/util/lib/Dom/canUseDom"));
var _Context = _interopRequireDefault(require("./Context"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const EMPTY_LIST = [];

/**
 * Will add `div` to document. Nest call will keep order
 * @param render Render DOM in document
 */
function useDom(render, debug) {
  const [ele] = React.useState(() => {
    if (!(0, _canUseDom.default)()) {
      return null;
    }
    const defaultEle = document.createElement('div');
    if (process.env.NODE_ENV !== 'production' && debug) {
      defaultEle.setAttribute('data-debug', debug);
    }
    return defaultEle;
  });

  // ========================== Order ==========================
  const appendedRef = React.useRef(false);
  const queueCreate = React.useContext(_Context.default);
  const [queue, setQueue] = React.useState(EMPTY_LIST);
  const mergedQueueCreate = queueCreate || (appendedRef.current ? undefined : appendFn => {
    setQueue(origin => {
      const newQueue = [appendFn, ...origin];
      return newQueue;
    });
  });

  // =========================== DOM ===========================
  function append() {
    if (!ele.parentElement) {
      document.body.appendChild(ele);
    }
    appendedRef.current = true;
  }
  function cleanup() {
    ele.parentElement?.removeChild(ele);
    appendedRef.current = false;
  }
  (0, _useLayoutEffect.default)(() => {
    if (render) {
      if (queueCreate) {
        queueCreate(append);
      } else {
        append();
      }
    } else {
      cleanup();
    }
    return cleanup;
  }, [render]);
  (0, _useLayoutEffect.default)(() => {
    if (queue.length) {
      queue.forEach(appendFn => appendFn());
      setQueue(EMPTY_LIST);
    }
  }, [queue]);
  return [ele, mergedQueueCreate];
}