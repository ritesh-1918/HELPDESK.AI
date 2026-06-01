import { create } from 'zustand';
import { createPersistedStore } from './persistenceMiddleware';

const useAdminStore = create(
    createPersistedStore('admin',
        (set) => ({
            adminProfile: {
                name: "Admin",
                email: "admin@helpdesk.ai",
                profile_picture: null,
                role: "Root Administrator",
                id: "ADM-0001",
                lastLogin: "",
                region: ""
            },
            updateProfile: (updates) => set((state) => ({
                adminProfile: { ...state.adminProfile, ...updates }
            })),
        })
    )
);

export default useAdminStore;
