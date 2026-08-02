import { matchNamePath } from "../utils/valueUtil";
/**
 * Call action with delay in macro task.
 */
const macroTask = fn => {
  const channel = new MessageChannel();
  channel.port1.onmessage = fn;
  channel.port2.postMessage(null);
};
export default class WatcherCenter {
  namePathList = [];
  taskId = 0;
  watcherList = new Set();
  form;
  constructor(form) {
    this.form = form;
  }
  register(callback) {
    this.watcherList.add(callback);
    return () => {
      this.watcherList.delete(callback);
    };
  }
  notify(namePath) {
    // Insert with deduplication
    namePath.forEach(path => {
      if (this.namePathList.every(exist => !matchNamePath(exist, path))) {
        this.namePathList.push(path);
      }
    });
    this.doBatch();
  }
  doBatch() {
    this.taskId += 1;
    const currentId = this.taskId;
    macroTask(() => {
      if (currentId === this.taskId && this.watcherList.size) {
        const formInst = this.form.getForm();
        const values = formInst.getFieldsValue();
        const allValues = formInst.getFieldsValue(true);
        this.watcherList.forEach(callback => {
          callback(values, allValues, this.namePathList);
        });
        this.namePathList = [];
      }
    });
  }
}