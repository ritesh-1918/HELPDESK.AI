"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.call = call;
exports.default = void 0;
exports.note = note;
exports.noteOnce = noteOnce;
exports.preMessage = void 0;
exports.resetWarned = resetWarned;
exports.warning = warning;
exports.warningOnce = warningOnce;
/* eslint-disable no-console */
let warned = {};
const preWarningFns = [];

/**
 * Pre warning enable you to parse content before console.error.
 * Modify to null will prevent warning.
 */
const preMessage = fn => {
  preWarningFns.push(fn);
};

/**
 * Warning if condition not match.
 * @param valid Condition
 * @param message Warning message
 * @example
 * ```js
 * warning(false, 'some error'); // print some error
 * warning(true, 'some error'); // print nothing
 * warning(1 === 2, 'some error'); // print some error
 * ```
 */
exports.preMessage = preMessage;
function warning(valid, message) {
  if (process.env.NODE_ENV !== 'production' && !valid && console !== undefined) {
    const finalMessage = preWarningFns.reduce((msg, preMessageFn) => preMessageFn(msg ?? '', 'warning'), message);
    if (finalMessage) {
      console.error(`Warning: ${finalMessage}`);
    }
  }
}

/** @see Similar to {@link warning} */
function note(valid, message) {
  if (process.env.NODE_ENV !== 'production' && !valid && console !== undefined) {
    const finalMessage = preWarningFns.reduce((msg, preMessageFn) => preMessageFn(msg ?? '', 'note'), message);
    if (finalMessage) {
      console.warn(`Note: ${finalMessage}`);
    }
  }
}
function resetWarned() {
  warned = {};
}
function call(method, valid, message) {
  if (!valid && !warned[message]) {
    method(false, message);
    warned[message] = true;
  }
}

/** @see Same as {@link warning}, but only warn once for the same message */
function warningOnce(valid, message) {
  call(warning, valid, message);
}

/** @see Same as {@link warning}, but only warn once for the same message */
function noteOnce(valid, message) {
  call(note, valid, message);
}
warningOnce.preMessage = preMessage;
warningOnce.resetWarned = resetWarned;
warningOnce.noteOnce = noteOnce;
var _default = exports.default = warningOnce;