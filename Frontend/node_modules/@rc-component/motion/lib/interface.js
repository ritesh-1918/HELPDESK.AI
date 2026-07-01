"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STEP_START = exports.STEP_PREPARED = exports.STEP_PREPARE = exports.STEP_NONE = exports.STEP_ACTIVE = exports.STEP_ACTIVATED = exports.STATUS_NONE = exports.STATUS_LEAVE = exports.STATUS_ENTER = exports.STATUS_APPEAR = void 0;
const STATUS_NONE = exports.STATUS_NONE = 'none';
const STATUS_APPEAR = exports.STATUS_APPEAR = 'appear';
const STATUS_ENTER = exports.STATUS_ENTER = 'enter';
const STATUS_LEAVE = exports.STATUS_LEAVE = 'leave';
const STEP_NONE = exports.STEP_NONE = 'none';
const STEP_PREPARE = exports.STEP_PREPARE = 'prepare';
const STEP_START = exports.STEP_START = 'start';
const STEP_ACTIVE = exports.STEP_ACTIVE = 'active';
const STEP_ACTIVATED = exports.STEP_ACTIVATED = 'end';
/**
 * Used for disabled motion case.
 * Prepare stage will still work but start & active will be skipped.
 */
const STEP_PREPARED = exports.STEP_PREPARED = 'prepared';