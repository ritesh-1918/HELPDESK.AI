import { create } from 'zustand';

const useToastStore = create((set) => ({
    toasts: [],

    /**
     * @param {string} message - The message to display
     * @param {'success' | 'error' | 'info' | 'warning'} type - Tone of the notification
     * @param {number} duration - Time in ms before auto-removal
     */
    showToast: (message, type = 'success', duration = 4000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, message, type };

        set((state) => ({
            toasts: [...state.toasts, newToast]
        }));

        if (duration !== Infinity) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id)
                }));
            }, duration);
        }
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id)
        }));
    }
}));

export default useToastStore;
