import { memoSupports } from './memo.mjs';

const supportsScrollTimeline = /* @__PURE__ */ memoSupports(() => window.ScrollTimeline !== undefined, "scrollTimeline");

export { supportsScrollTimeline };
//# sourceMappingURL=scroll-timeline.mjs.map
