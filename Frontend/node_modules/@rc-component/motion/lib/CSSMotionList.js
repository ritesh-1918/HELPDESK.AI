"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.genCSSMotionList = genCSSMotionList;
var React = _interopRequireWildcard(require("react"));
var _CSSMotion = _interopRequireDefault(require("./CSSMotion"));
var _diff = require("./util/diff");
var _motion = require("./util/motion");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); } /* eslint react/prop-types: 0 */
const MOTION_PROP_NAMES = ['eventProps', 'visible', 'children', 'motionName', 'motionAppear', 'motionEnter', 'motionLeave', 'motionLeaveImmediately', 'motionDeadline', 'removeOnLeave', 'leavedClassName', 'onAppearPrepare', 'onAppearStart', 'onAppearActive', 'onAppearEnd', 'onEnterStart', 'onEnterActive', 'onEnterEnd', 'onLeaveStart', 'onLeaveActive', 'onLeaveEnd'];
/**
 * Generate a CSSMotionList component with config
 * @param transitionSupport No need since CSSMotionList no longer depends on transition support
 * @param CSSMotion CSSMotion component
 */
function genCSSMotionList(transitionSupport, CSSMotion = _CSSMotion.default) {
  class CSSMotionList extends React.Component {
    static defaultProps = {
      component: 'div'
    };
    state = {
      keyEntities: []
    };
    static getDerivedStateFromProps({
      keys
    }, {
      keyEntities
    }) {
      const parsedKeyObjects = (0, _diff.parseKeys)(keys);
      const mixedKeyEntities = (0, _diff.diffKeys)(keyEntities, parsedKeyObjects);
      return {
        keyEntities: mixedKeyEntities.filter(entity => {
          const prevEntity = keyEntities.find(({
            key
          }) => entity.key === key);

          // Remove if already mark as removed
          if (prevEntity && prevEntity.status === _diff.STATUS_REMOVED && entity.status === _diff.STATUS_REMOVE) {
            return false;
          }
          return true;
        })
      };
    }

    // ZombieJ: Return the count of rest keys. It's safe to refactor if need more info.
    removeKey = removeKey => {
      this.setState(prevState => {
        const nextKeyEntities = prevState.keyEntities.map(entity => {
          if (entity.key !== removeKey) return entity;
          return {
            ...entity,
            status: _diff.STATUS_REMOVED
          };
        });
        return {
          keyEntities: nextKeyEntities
        };
      }, () => {
        const {
          keyEntities
        } = this.state;
        const restKeysCount = keyEntities.filter(({
          status
        }) => status !== _diff.STATUS_REMOVED).length;
        if (restKeysCount === 0 && this.props.onAllRemoved) {
          this.props.onAllRemoved();
        }
      });
    };
    render() {
      const {
        keyEntities
      } = this.state;
      const {
        component,
        children,
        onVisibleChanged,
        onAllRemoved,
        ...restProps
      } = this.props;
      const Component = component || React.Fragment;
      const motionProps = {};
      MOTION_PROP_NAMES.forEach(prop => {
        motionProps[prop] = restProps[prop];
        delete restProps[prop];
      });
      delete restProps.keys;
      return /*#__PURE__*/React.createElement(Component, restProps, keyEntities.map(({
        status,
        ...eventProps
      }, index) => {
        const visible = status === _diff.STATUS_ADD || status === _diff.STATUS_KEEP;
        return /*#__PURE__*/React.createElement(CSSMotion, _extends({}, motionProps, {
          key: eventProps.key,
          visible: visible,
          eventProps: eventProps,
          onVisibleChanged: changedVisible => {
            onVisibleChanged?.(changedVisible, {
              key: eventProps.key
            });
            if (!changedVisible) {
              this.removeKey(eventProps.key);
            }
          }
        }), (props, ref) => children({
          ...props,
          index
        }, ref));
      }));
    }
  }
  return CSSMotionList;
}
var _default = exports.default = genCSSMotionList(_motion.supportTransition);