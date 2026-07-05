export const analyzeTicket = (ticketText, image) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const baseEntities = ["VPN", "Remote Access", "Error 789"];
            const imageEntities = image ? ["Error 789", "Authentication Failed"] : [];

            resolve({
                summary: "Unable to connect to corporate VPN",
                category: "Network",
                subcategory: "VPN",
                priority: "High",
                auto_resolve: true,
                duplicate_ticket: 4512,
                entities: image
                    ? [...new Set([...baseEntities, ...imageEntities])]
                    : baseEntities,
                hasImage: !!image,
                ...(image && { extracted_from_image: imageEntities })
            });
        }, 2000);
    });
};
