import canUseDom from "@rc-component/util/es/Dom/canUseDom";
import { isStyleSupport } from "@rc-component/util/es/Dom/styleChecker";
export const canUseDocElement = () => canUseDom() && window.document.documentElement;
export { isStyleSupport };