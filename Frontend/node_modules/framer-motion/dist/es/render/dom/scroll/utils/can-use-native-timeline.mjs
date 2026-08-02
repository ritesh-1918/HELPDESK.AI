import { supportsScrollTimeline } from 'motion-dom';

function canUseNativeTimeline(target) {
    return (typeof window !== "undefined" && !target && supportsScrollTimeline());
}

export { canUseNativeTimeline };
//# sourceMappingURL=can-use-native-timeline.mjs.map
