export type OmitFocusType = 'focusTriggerAfterClose' | 'focusTrap' | 'autoFocusButton';
export interface FocusableConfig {
    focusTriggerAfterClose?: boolean;
    trap?: boolean;
}
export default function useFocusable(focusable?: FocusableConfig, defaultTrap?: boolean, legacyFocusTriggerAfterClose?: FocusableConfig['focusTriggerAfterClose']): {
    focusTriggerAfterClose?: boolean;
    trap?: boolean;
};
