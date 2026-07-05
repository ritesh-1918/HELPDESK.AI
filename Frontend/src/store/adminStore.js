import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
    persist(
        (set) => ({
            adminProfile: {
                name: "Ritesh Singh",
                email: "admin@emerald-prime.io",
                profile_picture: null,
                role: "Root Administrator",
                id: "ADM-9921-X",
                lastLogin: "2026-03-01 22:15:04",
                region: "Unified Global Ops"
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
