import { merge } from "@rc-component/util/es/utils/set";
import { mergeWith } from '@rc-component/util';
import warning from "@rc-component/util/es/warning";
import * as React from 'react';
import { HOOK_MARK } from "../FieldContext";
import { allPromiseFinish } from "../utils/asyncUtil";
import { defaultValidateMessages } from "../utils/messages";
import NameMap from "../utils/NameMap";
import { cloneByNamePathList, containsNamePath, getNamePath, getValue, matchNamePath, setValue } from "../utils/valueUtil";
import WatcherCenter from "./useNotifyWatch";
export class FormStore {
  formHooked = false;
  forceRootUpdate;
  subscribable = true;
  store = {};
  fieldEntities = [];
  initialValues = {};
  callbacks = {};
  validateMessages = null;
  preserve = null;
  lastValidatePromise = null;
  watcherCenter = new WatcherCenter(this);
  constructor(forceRootUpdate) {
    this.forceRootUpdate = forceRootUpdate;
  }
  getForm = () => ({
    getFieldValue: this.getFieldValue,
    getFieldsValue: this.getFieldsValue,
    getFieldError: this.getFieldError,
    getFieldWarning: this.getFieldWarning,
    getFieldsError: this.getFieldsError,
    isFieldsTouched: this.isFieldsTouched,
    isFieldTouched: this.isFieldTouched,
    isFieldValidating: this.isFieldValidating,
    isFieldsValidating: this.isFieldsValidating,
    resetFields: this.resetFields,
    setFields: this.setFields,
    setFieldValue: this.setFieldValue,
    setFieldsValue: this.setFieldsValue,
    validateFields: this.validateFields,
    submit: this.submit,
    _init: true,
    getInternalHooks: this.getInternalHooks
  });

  // ======================== Internal Hooks ========================
  getInternalHooks = key => {
    if (key === HOOK_MARK) {
      this.formHooked = true;
      return {
        dispatch: this.dispatch,
        initEntityValue: this.initEntityValue,
        registerField: this.registerField,
        useSubscribe: this.useSubscribe,
        setInitialValues: this.setInitialValues,
        destroyForm: this.destroyForm,
        setCallbacks: this.setCallbacks,
        setValidateMessages: this.setValidateMessages,
        getFields: this.getFields,
        setPreserve: this.setPreserve,
        getInitialValue: this.getInitialValue,
        registerWatch: this.registerWatch
      };
    }
    warning(false, '`getInternalHooks` is internal usage. Should not call directly.');
    return null;
  };
  useSubscribe = subscribable => {
    this.subscribable = subscribable;
  };

  /**
   * Record prev Form unmount fieldEntities which config preserve false.
   * This need to be refill with initialValues instead of store value.
   */
  prevWithoutPreserves = null;

  /**
   * First time `setInitialValues` should update store with initial value
   */
  setInitialValues = (initialValues, init) => {
    this.initialValues = initialValues || {};
    if (init) {
      let nextStore = merge(initialValues, this.store);

      // We will take consider prev form unmount fields.
      // When the field is not `preserve`, we need fill this with initialValues instead of store.
      // eslint-disable-next-line array-callback-return
      this.prevWithoutPreserves?.map(({
        key: namePath
      }) => {
        nextStore = setValue(nextStore, namePath, getValue(initialValues, namePath));
      });
      this.prevWithoutPreserves = null;
      this.updateStore(nextStore);
    }
  };
  destroyForm = clearOnDestroy => {
    if (clearOnDestroy) {
      // destroy form reset store
      this.updateStore({});
    } else {
      // Fill preserve fields
      const prevWithoutPreserves = new NameMap();
      this.getFieldEntities(true).forEach(entity => {
        if (!this.isMergedPreserve(entity.isPreserve())) {
          prevWithoutPreserves.set(entity.getNamePath(), true);
        }
      });
      this.prevWithoutPreserves = prevWithoutPreserves;
    }
  };
  getInitialValue = namePath => {
    const initValue = getValue(this.initialValues, namePath);

    // Not cloneDeep when without `namePath`
    return namePath.length ? merge(initValue) : initValue;
  };
  setCallbacks = callbacks => {
    this.callbacks = callbacks;
  };
  setValidateMessages = validateMessages => {
    this.validateMessages = validateMessages;
  };
  setPreserve = preserve => {
    this.preserve = preserve;
  };

  // ============================= Watch ============================
  registerWatch = callback => {
    return this.watcherCenter.register(callback);
  };
  notifyWatch = (namePath = []) => {
    this.watcherCenter.notify(namePath);
  };

  // ========================== Dev Warning =========================
  timeoutId = null;
  warningUnhooked = () => {
    if (process.env.NODE_ENV !== 'production' && !this.timeoutId && typeof window !== 'undefined') {
      this.timeoutId = setTimeout(() => {
        this.timeoutId = null;
        if (!this.formHooked) {
          warning(false, 'Instance created by `useForm` is not connected to any Form element. Forget to pass `form` prop?');
        }
      });
    }
  };

  // ============================ Store =============================
  updateStore = nextStore => {
    this.store = nextStore;
  };

  // ============================ Fields ============================
  /**
   * Get registered field entities.
   * @param pure Only return field which has a `name`. Default: false
   */
  getFieldEntities = (pure = false) => {
    if (!pure) {
      return this.fieldEntities;
    }
    return this.fieldEntities.filter(field => field.getNamePath().length);
  };

  /**
   * Get a map of registered field entities with their name path as the key.
   * @param pure Only include fields which have a `name`. Default: false
   * @returns A NameMap containing field entities indexed by their name paths
   */
  getFieldsMap = (pure = false) => {
    const cache = new NameMap();
    this.getFieldEntities(pure).forEach(field => {
      const namePath = field.getNamePath();
      cache.set(namePath, field);
    });
    return cache;
  };

  /**
   * Get field entities based on a list of name paths.
   * @param nameList - Array of name paths to search for. If not provided, returns all field entities with names.
   * @param includesSubNamePath - Whether to include fields that have the given name path as a prefix.
   */
  getFieldEntitiesForNamePathList = (nameList, includesSubNamePath = false) => {
    if (!nameList) {
      return this.getFieldEntities(true);
    }
    const cache = this.getFieldsMap(true);
    if (!includesSubNamePath) {
      return nameList.map(name => {
        const namePath = getNamePath(name);
        return cache.get(namePath) || {
          INVALIDATE_NAME_PATH: getNamePath(name)
        };
      });
    }
    return nameList.flatMap(name => {
      const namePath = getNamePath(name);
      const fields = cache.getAsPrefix(namePath);
      if (fields.length) {
        return fields;
      }
      return [{
        INVALIDATE_NAME_PATH: namePath
      }];
    });
  };
  getFieldsValue = (nameList, filterFunc) => {
    this.warningUnhooked();

    // Fill args
    let mergedNameList;
    let mergedFilterFunc;
    if (nameList === true || Array.isArray(nameList)) {
      mergedNameList = nameList;
      mergedFilterFunc = filterFunc;
    } else if (nameList && typeof nameList === 'object') {
      mergedFilterFunc = nameList.filter;
    }
    if (mergedNameList === true && !mergedFilterFunc) {
      return this.store;
    }
    const fieldEntities = this.getFieldEntitiesForNamePathList(Array.isArray(mergedNameList) ? mergedNameList : null, true);
    const filteredNameList = [];
    const listNamePaths = [];
    fieldEntities.forEach(entity => {
      const namePath = entity.INVALIDATE_NAME_PATH || entity.getNamePath();

      // Ignore when it's a list item and not specific the namePath,
      // since parent field is already take in count
      if (entity.isList?.()) {
        listNamePaths.push(namePath);
        return;
      }
      if (!mergedFilterFunc) {
        filteredNameList.push(namePath);
      } else {
        const meta = 'getMeta' in entity ? entity.getMeta() : null;
        if (mergedFilterFunc(meta)) {
          filteredNameList.push(namePath);
        }
      }
    });
    let mergedValues = cloneByNamePathList(this.store, filteredNameList.map(getNamePath));

    // We need fill the list as [] if Form.List is empty
    listNamePaths.forEach(namePath => {
      if (!getValue(mergedValues, namePath)) {
        mergedValues = setValue(mergedValues, namePath, []);
      }
    });
    return mergedValues;
  };
  getFieldValue = name => {
    this.warningUnhooked();
    const namePath = getNamePath(name);
    return getValue(this.store, namePath);
  };
  getFieldsError = nameList => {
    this.warningUnhooked();
    const fieldEntities = this.getFieldEntitiesForNamePathList(nameList);
    return fieldEntities.map((entity, index) => {
      if (entity && !entity.INVALIDATE_NAME_PATH) {
        return {
          name: entity.getNamePath(),
          errors: entity.getErrors(),
          warnings: entity.getWarnings()
        };
      }
      return {
        name: getNamePath(nameList[index]),
        errors: [],
        warnings: []
      };
    });
  };
  getFieldError = name => {
    this.warningUnhooked();
    const namePath = getNamePath(name);
    const fieldError = this.getFieldsError([namePath])[0];
    return fieldError.errors;
  };
  getFieldWarning = name => {
    this.warningUnhooked();
    const namePath = getNamePath(name);
    const fieldError = this.getFieldsError([namePath])[0];
    return fieldError.warnings;
  };
  isFieldsTouched = (...args) => {
    this.warningUnhooked();
    const [arg0, arg1] = args;
    let namePathList;
    let isAllFieldsTouched = false;
    if (args.length === 0) {
      namePathList = null;
    } else if (args.length === 1) {
      if (Array.isArray(arg0)) {
        namePathList = arg0.map(getNamePath);
        isAllFieldsTouched = false;
      } else {
        namePathList = null;
        isAllFieldsTouched = arg0;
      }
    } else {
      namePathList = arg0.map(getNamePath);
      isAllFieldsTouched = arg1;
    }
    const fieldEntities = this.getFieldEntities(true);
    const isFieldTouched = field => field.isFieldTouched();

    // ===== Will get fully compare when not config namePathList =====
    if (!namePathList) {
      return isAllFieldsTouched ? fieldEntities.every(entity => isFieldTouched(entity) || entity.isList()) : fieldEntities.some(isFieldTouched);
    }

    // Generate a nest tree for validate
    const map = new NameMap();
    namePathList.forEach(shortNamePath => {
      map.set(shortNamePath, []);
    });
    fieldEntities.forEach(field => {
      const fieldNamePath = field.getNamePath();

      // Find matched entity and put into list
      namePathList.forEach(shortNamePath => {
        if (shortNamePath.every((nameUnit, i) => fieldNamePath[i] === nameUnit)) {
          map.update(shortNamePath, list => [...list, field]);
        }
      });
    });

    // Check if NameMap value is touched
    const isNamePathListTouched = entities => entities.some(isFieldTouched);
    const namePathListEntities = map.map(({
      value
    }) => value);
    return isAllFieldsTouched ? namePathListEntities.every(isNamePathListTouched) : namePathListEntities.some(isNamePathListTouched);
  };
  isFieldTouched = name => {
    this.warningUnhooked();
    return this.isFieldsTouched([name]);
  };
  isFieldsValidating = nameList => {
    this.warningUnhooked();
    const fieldEntities = this.getFieldEntities();
    if (!nameList) {
      return fieldEntities.some(testField => testField.isFieldValidating());
    }
    const namePathList = nameList.map(getNamePath);
    return fieldEntities.some(testField => {
      const fieldNamePath = testField.getNamePath();
      return containsNamePath(namePathList, fieldNamePath) && testField.isFieldValidating();
    });
  };
  isFieldValidating = name => {
    this.warningUnhooked();
    return this.isFieldsValidating([name]);
  };

  /**
   * Reset Field with field `initialValue` prop.
   * Can pass `entities` or `namePathList` or just nothing.
   */
  resetWithFieldInitialValue = (info = {}) => {
    // Create cache
    const cache = new NameMap();
    const fieldEntities = this.getFieldEntities(true);
    fieldEntities.forEach(field => {
      const {
        initialValue
      } = field.props;
      const namePath = field.getNamePath();

      // Record only if has `initialValue`
      if (initialValue !== undefined) {
        const records = cache.get(namePath) || new Set();
        records.add({
          entity: field,
          value: initialValue
        });
        cache.set(namePath, records);
      }
    });

    // Reset
    const resetWithFields = entities => {
      entities.forEach(field => {
        const {
          initialValue
        } = field.props;
        if (initialValue !== undefined) {
          const namePath = field.getNamePath();
          const formInitialValue = this.getInitialValue(namePath);
          if (formInitialValue !== undefined) {
            // Warning if conflict with form initialValues and do not modify value
            warning(false, `Form already set 'initialValues' with path '${namePath.join('.')}'. Field can not overwrite it.`);
          } else {
            const records = cache.get(namePath);
            if (records && records.size > 1) {
              // Warning if multiple field set `initialValue`and do not modify value
              warning(false, `Multiple Field with path '${namePath.join('.')}' set 'initialValue'. Can not decide which one to pick.`);
            } else if (records) {
              const originValue = this.getFieldValue(namePath);
              const isListField = field.isListField();

              // Set `initialValue`
              if (!isListField && (!info.skipExist || originValue === undefined)) {
                this.updateStore(setValue(this.store, namePath, [...records][0].value));
              }
            }
          }
        }
      });
    };
    let requiredFieldEntities;
    if (info.entities) {
      requiredFieldEntities = info.entities;
    } else if (info.namePathList) {
      requiredFieldEntities = [];
      info.namePathList.forEach(namePath => {
        const records = cache.get(namePath);
        if (records) {
          requiredFieldEntities.push(...[...records].map(r => r.entity));
        }
      });
    } else {
      requiredFieldEntities = fieldEntities;
    }
    resetWithFields(requiredFieldEntities);
  };
  resetFields = nameList => {
    this.warningUnhooked();
    const prevStore = this.store;
    if (!nameList) {
      this.updateStore(merge(this.initialValues));
      this.resetWithFieldInitialValue();
      this.notifyObservers(prevStore, null, {
        type: 'reset'
      });
      this.notifyWatch();
      return;
    }

    // Reset by `nameList`
    const namePathList = nameList.map(getNamePath);
    namePathList.forEach(namePath => {
      const initialValue = this.getInitialValue(namePath);
      this.updateStore(setValue(this.store, namePath, initialValue));
    });
    this.resetWithFieldInitialValue({
      namePathList
    });
    this.notifyObservers(prevStore, namePathList, {
      type: 'reset'
    });
    this.notifyWatch(namePathList);
  };
  setFields = fields => {
    this.warningUnhooked();
    const prevStore = this.store;
    const namePathList = [];
    fields.forEach(fieldData => {
      const {
        name,
        ...data
      } = fieldData;
      const namePath = getNamePath(name);
      namePathList.push(namePath);

      // Value
      if ('value' in data) {
        this.updateStore(setValue(this.store, namePath, data.value));
      }
      this.notifyObservers(prevStore, [namePath], {
        type: 'setField',
        data: fieldData
      });
    });
    this.notifyWatch(namePathList);
  };
  getFields = () => {
    const entities = this.getFieldEntities(true);
    const fields = entities.map(field => {
      const namePath = field.getNamePath();
      const meta = field.getMeta();
      const fieldData = {
        ...meta,
        name: namePath,
        value: this.getFieldValue(namePath)
      };
      Object.defineProperty(fieldData, 'originRCField', {
        value: true
      });
      return fieldData;
    });
    return fields;
  };

  // =========================== Observer ===========================
  /**
   * This only trigger when a field is on constructor to avoid we get initialValue too late
   */
  initEntityValue = entity => {
    const {
      initialValue
    } = entity.props;
    if (initialValue !== undefined) {
      const namePath = entity.getNamePath();
      const prevValue = getValue(this.store, namePath);
      if (prevValue === undefined) {
        this.updateStore(setValue(this.store, namePath, initialValue));
      }
    }
  };
  isMergedPreserve = fieldPreserve => {
    const mergedPreserve = fieldPreserve !== undefined ? fieldPreserve : this.preserve;
    return mergedPreserve ?? true;
  };
  registerField = entity => {
    this.fieldEntities.push(entity);
    const namePath = entity.getNamePath();
    this.notifyWatch([namePath]);

    // Set initial values
    if (entity.props.initialValue !== undefined) {
      const prevStore = this.store;
      this.resetWithFieldInitialValue({
        entities: [entity],
        skipExist: true
      });
      this.notifyObservers(prevStore, [entity.getNamePath()], {
        type: 'valueUpdate',
        source: 'internal'
      });
    }

    // un-register field callback
    return (isListField, preserve, subNamePath = []) => {
      this.fieldEntities = this.fieldEntities.filter(item => item !== entity);

      // Clean up store value if not preserve
      if (!this.isMergedPreserve(preserve) && (!isListField || subNamePath.length > 1)) {
        const defaultValue = isListField ? undefined : this.getInitialValue(namePath);
        if (namePath.length && this.getFieldValue(namePath) !== defaultValue && this.fieldEntities.every(field =>
        // Only reset when no namePath exist
        !matchNamePath(field.getNamePath(), namePath))) {
          const prevStore = this.store;
          this.updateStore(setValue(prevStore, namePath, defaultValue, true));

          // Notify that field is unmount
          this.notifyObservers(prevStore, [namePath], {
            type: 'remove'
          });

          // Dependencies update
          this.triggerDependenciesUpdate(prevStore, namePath);
        }
      }
      this.notifyWatch([namePath]);
    };
  };
  dispatch = action => {
    switch (action.type) {
      case 'updateValue':
        {
          const {
            namePath,
            value
          } = action;
          this.updateValue(namePath, value);
          break;
        }
      case 'validateField':
        {
          const {
            namePath,
            triggerName
          } = action;
          this.validateFields([namePath], {
            triggerName
          });
          break;
        }
      default:
      // Currently we don't have other action. Do nothing.
    }
  };
  notifyObservers = (prevStore, namePathList, info) => {
    if (this.subscribable) {
      const mergedInfo = {
        ...info,
        store: this.getFieldsValue(true)
      };
      this.getFieldEntities().forEach(({
        onStoreChange
      }) => {
        onStoreChange(prevStore, namePathList, mergedInfo);
      });
    } else {
      this.forceRootUpdate();
    }
  };

  /**
   * Notify dependencies children with parent update
   * We need delay to trigger validate in case Field is under render props
   */
  triggerDependenciesUpdate = (prevStore, namePath) => {
    const childrenFields = this.getDependencyChildrenFields(namePath);
    if (childrenFields.length) {
      this.validateFields(childrenFields);
    }
    this.notifyObservers(prevStore, childrenFields, {
      type: 'dependenciesUpdate',
      relatedFields: [namePath, ...childrenFields]
    });
    return childrenFields;
  };
  updateValue = (name, value) => {
    const namePath = getNamePath(name);
    const prevStore = this.store;
    this.updateStore(setValue(this.store, namePath, value));
    this.notifyObservers(prevStore, [namePath], {
      type: 'valueUpdate',
      source: 'internal'
    });
    this.notifyWatch([namePath]);

    // Dependencies update
    const childrenFields = this.triggerDependenciesUpdate(prevStore, namePath);

    // trigger callback function
    const {
      onValuesChange
    } = this.callbacks;
    if (onValuesChange) {
      const fieldEntity = this.getFieldsMap(true).get(namePath);
      const changedValues = cloneByNamePathList(this.store, [namePath]);
      const allValues = this.getFieldsValue();
      // Merge changedValues into allValues to ensure allValues contains the latest changes
      const mergedAllValues = mergeWith([allValues, changedValues], {
        // When value is array, it means trigger by Form.List which should replace directly
        prepareArray: current => fieldEntity?.isList() ? [] : [...(current || [])]
      });
      onValuesChange(changedValues, mergedAllValues);
    }
    this.triggerOnFieldsChange([namePath, ...childrenFields]);
  };

  // Let all child Field get update.
  setFieldsValue = store => {
    this.warningUnhooked();
    const prevStore = this.store;
    if (store) {
      const nextStore = merge(this.store, store);
      this.updateStore(nextStore);
    }
    this.notifyObservers(prevStore, null, {
      type: 'valueUpdate',
      source: 'external'
    });
    this.notifyWatch();
  };
  setFieldValue = (name, value) => {
    this.setFields([{
      name,
      value,
      errors: [],
      warnings: [],
      touched: true
    }]);
  };
  getDependencyChildrenFields = rootNamePath => {
    const children = new Set();
    const childrenFields = [];
    const dependencies2fields = new NameMap();

    /**
     * Generate maps
     * Can use cache to save perf if user report performance issue with this
     */
    this.getFieldEntities().forEach(field => {
      const {
        dependencies
      } = field.props;
      (dependencies || []).forEach(dependency => {
        const dependencyNamePath = getNamePath(dependency);
        dependencies2fields.update(dependencyNamePath, (fields = new Set()) => {
          fields.add(field);
          return fields;
        });
      });
    });
    const fillChildren = namePath => {
      const fields = dependencies2fields.get(namePath) || new Set();
      fields.forEach(field => {
        if (!children.has(field)) {
          children.add(field);
          const fieldNamePath = field.getNamePath();
          if (field.isFieldDirty() && fieldNamePath.length) {
            childrenFields.push(fieldNamePath);
            fillChildren(fieldNamePath);
          }
        }
      });
    };
    fillChildren(rootNamePath);
    return childrenFields;
  };
  triggerOnFieldsChange = (namePathList, filedErrors) => {
    const {
      onFieldsChange
    } = this.callbacks;
    if (onFieldsChange) {
      const fields = this.getFields();

      /**
       * Fill errors since `fields` may be replaced by controlled fields
       */
      if (filedErrors) {
        const cache = new NameMap();
        filedErrors.forEach(({
          name,
          errors
        }) => {
          cache.set(name, errors);
        });
        fields.forEach(field => {
          // eslint-disable-next-line no-param-reassign
          field.errors = cache.get(field.name) || field.errors;
        });
      }
      const changedFields = fields.filter(({
        name: fieldName
      }) => containsNamePath(namePathList, fieldName));
      if (changedFields.length) {
        onFieldsChange(changedFields, fields);
      }
    }
  };

  // =========================== Validate ===========================
  validateFields = (arg1, arg2) => {
    this.warningUnhooked();
    let nameList;
    let options;
    if (Array.isArray(arg1) || typeof arg1 === 'string' || typeof arg2 === 'string') {
      nameList = arg1;
      options = arg2;
    } else {
      options = arg1;
    }
    const provideNameList = !!nameList;
    const namePathList = provideNameList ? nameList.map(getNamePath) : [];
    // Same namePathList, but does not include Form.List name
    const finalValueNamePathList = [...namePathList];

    // Collect result in promise list
    const promiseList = [];

    // We temp save the path which need trigger for `onFieldsChange`
    const TMP_SPLIT = String(Date.now());
    const validateNamePathList = new Set();
    const {
      recursive,
      dirty
    } = options || {};
    this.getFieldEntities(true).forEach(field => {
      const fieldNamePath = field.getNamePath();

      // Add field if not provide `nameList`
      if (!provideNameList) {
        if (
        // If is field, pass directly
        !field.isList() ||
        // If is list, do not add if already exist sub field in the namePathList
        !namePathList.some(name => matchNamePath(name, fieldNamePath, true))) {
          finalValueNamePathList.push(fieldNamePath);
        }
        namePathList.push(fieldNamePath);
      }

      // Skip if without rule
      if (!field.props.rules || !field.props.rules.length) {
        return;
      }

      // Skip if only validate dirty field
      if (dirty && !field.isFieldDirty()) {
        return;
      }
      validateNamePathList.add(fieldNamePath.join(TMP_SPLIT));

      // Add field validate rule in to promise list
      if (!provideNameList || containsNamePath(namePathList, fieldNamePath, recursive)) {
        const promise = field.validateRules({
          validateMessages: {
            ...defaultValidateMessages,
            ...this.validateMessages
          },
          ...options
        });

        // Wrap promise with field
        promiseList.push(promise.then(() => ({
          name: fieldNamePath,
          errors: [],
          warnings: []
        })).catch(ruleErrors => {
          const mergedErrors = [];
          const mergedWarnings = [];
          ruleErrors.forEach?.(({
            rule: {
              warningOnly
            },
            errors
          }) => {
            if (warningOnly) {
              mergedWarnings.push(...errors);
            } else {
              mergedErrors.push(...errors);
            }
          });
          if (mergedErrors.length) {
            return Promise.reject({
              name: fieldNamePath,
              errors: mergedErrors,
              warnings: mergedWarnings
            });
          }
          return {
            name: fieldNamePath,
            errors: mergedErrors,
            warnings: mergedWarnings
          };
        }));
      }
    });
    const summaryPromise = allPromiseFinish(promiseList);
    this.lastValidatePromise = summaryPromise;

    // Notify fields with rule that validate has finished and need update
    summaryPromise.catch(results => results).then(results => {
      const resultNamePathList = results.map(({
        name
      }) => name);
      this.notifyObservers(this.store, resultNamePathList, {
        type: 'validateFinish'
      });
      this.triggerOnFieldsChange(resultNamePathList, results);
    });
    const returnPromise = summaryPromise.then(() => {
      if (this.lastValidatePromise === summaryPromise) {
        return Promise.resolve(this.getFieldsValue(finalValueNamePathList));
      }
      return Promise.reject([]);
    }).catch(results => {
      const errorList = results.filter(result => result && result.errors.length);
      const errorMessage = errorList[0]?.errors?.[0];
      return Promise.reject({
        message: errorMessage,
        values: this.getFieldsValue(namePathList),
        errorFields: errorList,
        outOfDate: this.lastValidatePromise !== summaryPromise
      });
    });

    // Do not throw in console
    returnPromise.catch(e => e);

    // `validating` changed. Trigger `onFieldsChange`
    const triggerNamePathList = namePathList.filter(namePath => validateNamePathList.has(namePath.join(TMP_SPLIT)));
    this.triggerOnFieldsChange(triggerNamePathList);
    return returnPromise;
  };

  // ============================ Submit ============================
  submit = () => {
    this.warningUnhooked();
    this.validateFields().then(values => {
      const {
        onFinish
      } = this.callbacks;
      if (onFinish) {
        try {
          onFinish(values);
        } catch (err) {
          // Should print error if user `onFinish` callback failed
          console.error(err);
        }
      }
    }).catch(e => {
      const {
        onFinishFailed
      } = this.callbacks;
      if (onFinishFailed) {
        onFinishFailed(e);
      }
    });
  };
}
function useForm(form) {
  const formRef = React.useRef(null);
  const [, forceUpdate] = React.useState({});

  // Create singleton FormStore
  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      // Create a new FormStore if not provided
      const forceReRender = () => {
        forceUpdate({});
      };
      const formStore = new FormStore(forceReRender);
      formRef.current = formStore.getForm();
    }
  }
  return [formRef.current];
}
export default useForm;