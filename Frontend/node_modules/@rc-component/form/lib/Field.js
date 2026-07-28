"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _toArray = _interopRequireDefault(require("@rc-component/util/lib/Children/toArray"));
var _isEqual = _interopRequireDefault(require("@rc-component/util/lib/isEqual"));
var _warning = _interopRequireDefault(require("@rc-component/util/lib/warning"));
var React = _interopRequireWildcard(require("react"));
var _FieldContext = _interopRequireWildcard(require("./FieldContext"));
var _ListContext = _interopRequireDefault(require("./ListContext"));
var _typeUtil = require("./utils/typeUtil");
var _validateUtil = require("./utils/validateUtil");
var _valueUtil = require("./utils/valueUtil");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
const EMPTY_ERRORS = [];
const EMPTY_WARNINGS = [];
function requireUpdate(shouldUpdate, prev, next, prevValue, nextValue, info) {
  if (typeof shouldUpdate === 'function') {
    return shouldUpdate(prev, next, 'source' in info ? {
      source: info.source
    } : {});
  }
  return prevValue !== nextValue;
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style

// We use Class instead of Hooks here since it will cost much code by using Hooks.
class Field extends React.Component {
  static contextType = _FieldContext.default;
  state = {
    resetCount: 0
  };
  cancelRegisterFunc = null;
  mounted = false;

  /**
   * Follow state should not management in State since it will async update by React.
   * This makes first render of form can not get correct state value.
   */
  touched = false;

  /**
   * Mark when touched & validated. Currently only used for `dependencies`.
   * Note that we do not think field with `initialValue` is dirty
   * but this will be by `isFieldDirty` func.
   */
  dirty = false;
  validatePromise;
  prevValidating;
  errors = EMPTY_ERRORS;
  warnings = EMPTY_WARNINGS;

  // ============================== Subscriptions ==============================
  constructor(props) {
    super(props);

    // Register on init
    if (props.fieldContext) {
      const {
        getInternalHooks
      } = props.fieldContext;
      const {
        initEntityValue
      } = getInternalHooks(_FieldContext.HOOK_MARK);
      initEntityValue(this);
    }
  }
  componentDidMount() {
    const {
      shouldUpdate,
      fieldContext
    } = this.props;
    this.mounted = true;

    // Register on init
    if (fieldContext) {
      const {
        getInternalHooks
      } = fieldContext;
      const {
        registerField
      } = getInternalHooks(_FieldContext.HOOK_MARK);
      this.cancelRegisterFunc = registerField(this);
    }

    // One more render for component in case fields not ready
    if (shouldUpdate === true) {
      this.reRender();
    }
  }
  componentWillUnmount() {
    this.cancelRegister();
    this.triggerMetaEvent(true);
    this.mounted = false;
  }
  cancelRegister = () => {
    const {
      preserve,
      isListField,
      name
    } = this.props;
    if (this.cancelRegisterFunc) {
      this.cancelRegisterFunc(isListField, preserve, (0, _valueUtil.getNamePath)(name));
    }
    this.cancelRegisterFunc = null;
  };

  // ================================== Utils ==================================
  getNamePath = () => {
    const {
      name,
      fieldContext
    } = this.props;
    const {
      prefixName = []
    } = fieldContext;
    return name !== undefined ? [...prefixName, ...name] : [];
  };
  getRules = () => {
    const {
      rules = [],
      fieldContext
    } = this.props;
    return rules.map(rule => {
      if (typeof rule === 'function') {
        return rule(fieldContext);
      }
      return rule;
    });
  };
  reRender() {
    if (!this.mounted) return;
    this.forceUpdate();
  }
  refresh = () => {
    if (!this.mounted) return;

    /**
     * Clean up current node.
     */
    this.setState(({
      resetCount
    }) => ({
      resetCount: resetCount + 1
    }));
  };

  // Event should only trigger when meta changed
  metaCache = null;
  triggerMetaEvent = destroy => {
    const {
      onMetaChange
    } = this.props;
    if (onMetaChange) {
      const meta = {
        ...this.getMeta(),
        destroy
      };
      if (!(0, _isEqual.default)(this.metaCache, meta)) {
        onMetaChange(meta);
      }
      this.metaCache = meta;
    } else {
      this.metaCache = null;
    }
  };

  // ========================= Field Entity Interfaces =========================
  // Trigger by store update. Check if need update the component
  onStoreChange = (prevStore, namePathList, info) => {
    const {
      shouldUpdate,
      dependencies = [],
      onReset
    } = this.props;
    const {
      store
    } = info;
    const namePath = this.getNamePath();
    const prevValue = this.getValue(prevStore);
    const curValue = this.getValue(store);
    const namePathMatch = namePathList && (0, _valueUtil.containsNamePath)(namePathList, namePath);

    // `setFieldsValue` is a quick access to update related status
    if (info.type === 'valueUpdate' && info.source === 'external' && !(0, _isEqual.default)(prevValue, curValue)) {
      this.touched = true;
      this.dirty = true;
      this.validatePromise = null;
      this.errors = EMPTY_ERRORS;
      this.warnings = EMPTY_WARNINGS;
      this.triggerMetaEvent();
    }
    switch (info.type) {
      case 'reset':
        if (!namePathList || namePathMatch) {
          // Clean up state
          this.touched = false;
          this.dirty = false;
          this.validatePromise = undefined;
          this.errors = EMPTY_ERRORS;
          this.warnings = EMPTY_WARNINGS;
          this.triggerMetaEvent();
          onReset?.();
          this.refresh();
          return;
        }
        break;

      /**
       * In case field with `preserve = false` nest deps like:
       * - A = 1 => show B
       * - B = 1 => show C
       * - Reset A, need clean B, C
       */
      case 'remove':
        {
          if (shouldUpdate && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)) {
            this.reRender();
            return;
          }
          break;
        }
      case 'setField':
        {
          const {
            data
          } = info;
          if (namePathMatch) {
            if ('touched' in data) {
              this.touched = data.touched;
            }
            if ('validating' in data && !('originRCField' in data)) {
              this.validatePromise = data.validating ? Promise.resolve([]) : null;
            }
            if ('errors' in data) {
              this.errors = data.errors || EMPTY_ERRORS;
            }
            if ('warnings' in data) {
              this.warnings = data.warnings || EMPTY_WARNINGS;
            }
            this.dirty = true;
            this.triggerMetaEvent();
            this.reRender();
            return;
          } else if ('value' in data && (0, _valueUtil.containsNamePath)(namePathList, namePath, true)) {
            // Contains path with value should also check
            this.reRender();
            return;
          }

          // Handle update by `setField` with `shouldUpdate`
          if (shouldUpdate && !namePath.length && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)) {
            this.reRender();
            return;
          }
          break;
        }
      case 'dependenciesUpdate':
        {
          /**
           * Trigger when marked `dependencies` updated. Related fields will all update
           */
          const dependencyList = dependencies.map(_valueUtil.getNamePath);
          // No need for `namePathMath` check and `shouldUpdate` check, since `valueUpdate` will be
          // emitted earlier and they will work there
          // If set it may cause unnecessary twice rerendering
          if (dependencyList.some(dependency => (0, _valueUtil.containsNamePath)(info.relatedFields, dependency))) {
            this.reRender();
            return;
          }
          break;
        }
      default:
        // 1. If `namePath` exists in `namePathList`, means it's related value and should update
        //      For example <List name="list"><Field name={['list', 0]}></List>
        //      If `namePathList` is [['list']] (List value update), Field should be updated
        //      If `namePathList` is [['list', 0]] (Field value update), List shouldn't be updated
        // 2.
        //   2.1 If `dependencies` is set, `name` is not set and `shouldUpdate` is not set,
        //       don't use `shouldUpdate`. `dependencies` is view as a shortcut if `shouldUpdate`
        //       is not provided
        //   2.2 If `shouldUpdate` provided, use customize logic to update the field
        //       else to check if value changed
        if (namePathMatch || (!dependencies.length || namePath.length || shouldUpdate) && requireUpdate(shouldUpdate, prevStore, store, prevValue, curValue, info)) {
          this.reRender();
          return;
        }
        break;
    }
    if (shouldUpdate === true) {
      this.reRender();
    }
  };
  validateRules = options => {
    // We should fixed namePath & value to avoid developer change then by form function
    const namePath = this.getNamePath();
    const currentValue = this.getValue();
    const {
      triggerName,
      validateOnly = false
    } = options || {};

    // Force change to async to avoid rule OOD under renderProps field
    const rootPromise = Promise.resolve().then(async () => {
      if (!this.mounted) {
        return [];
      }
      const {
        validateFirst = false,
        messageVariables,
        validateDebounce
      } = this.props;

      // Start validate
      let filteredRules = this.getRules();
      if (triggerName) {
        filteredRules = filteredRules.filter(rule => rule).filter(rule => {
          const {
            validateTrigger
          } = rule;
          if (!validateTrigger) {
            return true;
          }
          const triggerList = (0, _typeUtil.toArray)(validateTrigger);
          return triggerList.includes(triggerName);
        });
      }

      // Wait for debounce. Skip if no `triggerName` since its from `validateFields / submit`
      if (validateDebounce && triggerName) {
        await new Promise(resolve => {
          setTimeout(resolve, validateDebounce);
        });

        // Skip since out of date
        if (this.validatePromise !== rootPromise) {
          return [];
        }
      }
      const promise = (0, _validateUtil.validateRules)(namePath, currentValue, filteredRules, options, validateFirst, messageVariables);
      promise.catch(e => e).then((ruleErrors = EMPTY_ERRORS) => {
        if (this.validatePromise === rootPromise) {
          this.validatePromise = null;

          // Get errors & warnings
          const nextErrors = [];
          const nextWarnings = [];
          ruleErrors.forEach?.(({
            rule: {
              warningOnly
            },
            errors = EMPTY_ERRORS
          }) => {
            if (warningOnly) {
              nextWarnings.push(...errors);
            } else {
              nextErrors.push(...errors);
            }
          });
          this.errors = nextErrors;
          this.warnings = nextWarnings;
          this.triggerMetaEvent();
          this.reRender();
        }
      });
      return promise;
    });
    if (validateOnly) {
      return rootPromise;
    }
    this.validatePromise = rootPromise;
    this.dirty = true;
    this.errors = EMPTY_ERRORS;
    this.warnings = EMPTY_WARNINGS;
    this.triggerMetaEvent();

    // Force trigger re-render since we need sync renderProps with new meta
    this.reRender();
    return rootPromise;
  };
  isFieldValidating = () => !!this.validatePromise;
  isFieldTouched = () => this.touched;
  isFieldDirty = () => {
    // Touched or validate or has initialValue
    if (this.dirty || this.props.initialValue !== undefined) {
      return true;
    }

    // Form set initialValue
    const {
      fieldContext
    } = this.props;
    const {
      getInitialValue
    } = fieldContext.getInternalHooks(_FieldContext.HOOK_MARK);
    if (getInitialValue(this.getNamePath()) !== undefined) {
      return true;
    }
    return false;
  };
  getErrors = () => this.errors;
  getWarnings = () => this.warnings;
  isListField = () => this.props.isListField;
  isList = () => this.props.isList;
  isPreserve = () => this.props.preserve;

  // ============================= Child Component =============================
  getMeta = () => {
    // Make error & validating in cache to save perf
    this.prevValidating = this.isFieldValidating();
    const meta = {
      touched: this.isFieldTouched(),
      validating: this.prevValidating,
      errors: this.errors,
      warnings: this.warnings,
      name: this.getNamePath(),
      validated: this.validatePromise === null
    };
    return meta;
  };

  // Only return validate child node. If invalidate, will do nothing about field.
  getOnlyChild = children => {
    // Support render props
    if (typeof children === 'function') {
      const meta = this.getMeta();
      return {
        ...this.getOnlyChild(children(this.getControlled(), meta, this.props.fieldContext)),
        isFunction: true
      };
    }

    // Filed element only
    const childList = (0, _toArray.default)(children);
    if (childList.length !== 1 || ! /*#__PURE__*/React.isValidElement(childList[0])) {
      return {
        child: childList,
        isFunction: false
      };
    }
    return {
      child: childList[0],
      isFunction: false
    };
  };

  // ============================== Field Control ==============================
  getValue = store => {
    const {
      getFieldsValue
    } = this.props.fieldContext;
    const namePath = this.getNamePath();
    return (0, _valueUtil.getValue)(store || getFieldsValue(true), namePath);
  };
  getControlled = (childProps = {}) => {
    const {
      name,
      trigger = 'onChange',
      validateTrigger,
      getValueFromEvent,
      normalize,
      valuePropName = 'value',
      getValueProps,
      fieldContext
    } = this.props;
    const mergedValidateTrigger = validateTrigger !== undefined ? validateTrigger : fieldContext.validateTrigger;
    const namePath = this.getNamePath();
    const {
      getInternalHooks,
      getFieldsValue
    } = fieldContext;
    const {
      dispatch
    } = getInternalHooks(_FieldContext.HOOK_MARK);
    const value = this.getValue();
    const mergedGetValueProps = getValueProps || (val => ({
      [valuePropName]: val
    }));
    const originTriggerFunc = childProps[trigger];
    const valueProps = name !== undefined ? mergedGetValueProps(value) : {};

    // warning when prop value is function
    if (process.env.NODE_ENV !== 'production' && valueProps) {
      Object.keys(valueProps).forEach(key => {
        (0, _warning.default)(typeof valueProps[key] !== 'function', `It's not recommended to generate dynamic function prop by \`getValueProps\`. Please pass it to child component directly (prop: ${key})`);
      });
    }
    const control = {
      ...childProps,
      ...valueProps
    };

    // Add trigger
    control[trigger] = (...args) => {
      // Mark as touched
      this.touched = true;
      this.dirty = true;
      this.triggerMetaEvent();
      let newValue;
      if (getValueFromEvent) {
        newValue = getValueFromEvent(...args);
      } else {
        newValue = (0, _valueUtil.defaultGetValueFromEvent)(valuePropName, ...args);
      }
      if (normalize) {
        newValue = normalize(newValue, value, getFieldsValue(true));
      }
      if (newValue !== value) {
        dispatch({
          type: 'updateValue',
          namePath,
          value: newValue
        });
      }
      if (originTriggerFunc) {
        originTriggerFunc(...args);
      }
    };

    // Add validateTrigger
    const validateTriggerList = (0, _typeUtil.toArray)(mergedValidateTrigger || []);
    validateTriggerList.forEach(triggerName => {
      // Wrap additional function of component, so that we can get latest value from store
      const originTrigger = control[triggerName];
      control[triggerName] = (...args) => {
        if (originTrigger) {
          originTrigger(...args);
        }

        // Always use latest rules
        const {
          rules
        } = this.props;
        if (rules && rules.length) {
          // We dispatch validate to root,
          // since it will update related data with other field with same name
          dispatch({
            type: 'validateField',
            namePath,
            triggerName
          });
        }
      };
    });
    return control;
  };
  render() {
    const {
      resetCount
    } = this.state;
    const {
      children
    } = this.props;
    const {
      child,
      isFunction
    } = this.getOnlyChild(children);

    // Not need to `cloneElement` since user can handle this in render function self
    let returnChildNode;
    if (isFunction) {
      returnChildNode = child;
    } else if ( /*#__PURE__*/React.isValidElement(child)) {
      returnChildNode = /*#__PURE__*/React.cloneElement(child, this.getControlled(child.props));
    } else {
      (0, _warning.default)(!child, '`children` of Field is not validate ReactElement.');
      returnChildNode = child;
    }
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: resetCount
    }, returnChildNode);
  }
}
function WrapperField({
  name,
  ...restProps
}) {
  const fieldContext = React.useContext(_FieldContext.default);
  const listContext = React.useContext(_ListContext.default);
  const namePath = name !== undefined ? (0, _valueUtil.getNamePath)(name) : undefined;
  const isMergedListField = restProps.isListField ?? !!listContext;
  let key = 'keep';
  if (!isMergedListField) {
    key = `_${(namePath || []).join('_')}`;
  }

  // Warning if it's a directly list field.
  // We can still support multiple level field preserve.
  if (process.env.NODE_ENV !== 'production' && restProps.preserve === false && isMergedListField && namePath.length <= 1) {
    (0, _warning.default)(false, '`preserve` should not apply on Form.List fields.');
  }
  return /*#__PURE__*/React.createElement(Field, _extends({
    key: key,
    name: namePath,
    isListField: isMergedListField
  }, restProps, {
    fieldContext: fieldContext
  }));
}
var _default = exports.default = WrapperField;