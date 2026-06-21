// Network status listener
import NetInfo from '@react-native-community/netinfo';

export const watchNetworkConnection = (supabaseClient) => {
    NetInfo.addEventListener(state => {
        if (state.isConnected) {
            // Reconnect Supabase channels
            supabaseClient.removeAllChannels();
        }
    });
};
