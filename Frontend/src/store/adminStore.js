import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
    persist(
        (set) => ({
            adminProfile: {
                name: "Admin",
                email: "admin@helpdesk.ai",
                profile_picture: null,
                role: "Administrator",
                id: null,
                lastLogin: null,
                region: null
            },
            updateProfile: (updates) => set((state) => ({
                adminProfile: { ...state.adminProfile, ...updates }
            })),
        }),
        {
            name: 'admin-storage',
        }
    )
);

export default useAdminStore;
