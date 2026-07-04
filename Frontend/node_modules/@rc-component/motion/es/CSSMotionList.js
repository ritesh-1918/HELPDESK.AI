function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
/* eslint react/prop-types: 0 */
import * as React from 'react';
import OriginCSSMotion from "./CSSMotion";
import { diffKeys, parseKeys, STATUS_ADD, STATUS_KEEP, STATUS_REMOVE, STATUS_REMOVED } from "./util/diff";
import { supportTransition } from "./util/motion";
const MOTION_PROP_NAMES = ['eventProps', 'visible', 'children', 'motionName', 'motionAppear', 'motionEnter', 'motionLeave', 'motionLeaveImmediately', 'motionDeadline', 'removeOnLeave', 'leavedClassName', 'onAppearPrepare', 'onAppearStart', 'onAppearActive', 'onAppearEnd', 'onEnterStart', 'onEnterActive', 'onEnterEnd', 'onLeaveStart', 'onLeaveActive', 'onLeaveEnd'];
/**
 * Generate a CSSMotionList component with config
 * @param transitionSupport No need since CSSMotionList no longer depends on transition support
 * @param CSSMotion CSSMotion component
 */
export function genCSSMotionList(transitionSupport, CSSMotion = OriginCSSMotion) {
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
      const parsedKeyObjects = parseKeys(keys);
      const mixedKeyEntities = diffKeys(keyEntities, parsedKeyObjects);
      return {
        keyEntities: mixedKeyEntities.filter(entity => {
          const prevEntity = keyEntities.find(({
            key
          }) => entity.key === key);

          // Remove if already mark as removed
          if (prevEntity && prevEntity.status === STATUS_REMOVED && entity.status === STATUS_REMOVE) {
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
            status: STATUS_REMOVED
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
        }) => status !== STATUS_REMOVED).length;
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
        const visible = status === STATUS_ADD || status === STATUS_KEEP;
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
export default genCSSMotionList(supportTransition);