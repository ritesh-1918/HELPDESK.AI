export const STATUS_NONE = 'none';
export const STATUS_APPEAR = 'appear';
export const STATUS_ENTER = 'enter';
export const STATUS_LEAVE = 'leave';
export const STEP_NONE = 'none';
export const STEP_PREPARE = 'prepare';
export const STEP_START = 'start';
export const STEP_ACTIVE = 'active';
export const STEP_ACTIVATED = 'end';
/**
 * Used for disabled motion case.
 * Prepare stage will still work but start & active will be skipped.
 */
export const STEP_PREPARED = 'prepared';