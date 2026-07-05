import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
    persist(
        (set) => ({
            users: [], // System users for management
            settings: {
                aiConfidenceThreshold: 0.80,
                duplicateSensitivity: 0.85,
                enableAutoResolve: false,
                autoCloseDays: 7,
                emailNotifications: false,
                adminAlerts: false
            },

            setUsers: (users) => set({ users }),
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            // Mock function to add a user
            addUser: (user) => set((state) => ({
                users: [...state.users, { ...user, id: Date.now() }]
            })),

            // Mock function to delete a user
            deleteUser: (userId) => set((state) => ({
                users: state.users.filter(u => u.id !== userId)
            })),
        }),
        {
            name: 'admin-storage-settings',
        }
    )
);

export default useAdminStore;
