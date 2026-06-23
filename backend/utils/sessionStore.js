const revokedTokens = new Set();

const sessionStore = {
    revoke(token) {
        revokedTokens.add(token);
    },
    isRevoked(token) {
        return revokedTokens.has(token);
    },
    clearExpired() {
        // Optional: implement TTL-based cleanup
        // For now, we keep revoked tokens indefinitely
    }
};

module.exports = sessionStore;
