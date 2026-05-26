import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useTicketStore from '../store/ticketStore';
import { API_CONFIG } from '../config';

const useTicketsRealtime = () => {
    const { user, profile } = useAuthStore();
    const { connectWebSocket, disconnectWebSocket } = useTicketStore();

    useEffect(() => {
        if (!user || !profile) return;

        // Only admins see the live ticket queue
        const isAdmin = profile.role === 'admin' || profile.role === 'master_admin';
        if (!isAdmin) return;

        connectWebSocket(profile.company_id, API_CONFIG.BACKEND_URL);

        return () => {
            disconnectWebSocket();
        };
    }, [user, profile, connectWebSocket, disconnectWebSocket]);
};

export default useTicketsRealtime;