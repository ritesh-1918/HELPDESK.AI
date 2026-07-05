export const MOCK_USERS = [
    { id: 1, name: 'John Doe', username: 'test@test.com', password: 'password123', role: 'user' },
    { id: 2, name: 'Jane Smith', username: 'admin@test.com', password: 'password123', role: 'admin' },
];

export const MOCK_TICKETS = [
    {
        id: 101,
        title: 'Login Failure',
        description: 'Cannot login to the HR portal with my credentials.',
        category: 'Authentication',
        priority: 'High',
        status: 'Open',
        createdAt: '2023-10-27T10:00:00Z',
        userId: 1,
        messages: [
            {
                sender: 'user',
                message: 'Cannot login to the HR portal with my credentials.',
                timestamp: '2023-10-27T10:00:00Z'
            }
        ]
    },
    {
        id: 102,
        title: 'Printer Jam',
        description: 'The printer on the 2nd floor is jammed again.',
        category: 'Hardware',
        priority: 'Medium',
        status: 'In Progress',
        createdAt: '2023-10-26T14:30:00Z',
        userId: 1,
        messages: [
            {
                sender: 'user',
                message: 'The printer on the 2nd floor is jammed again.',
                timestamp: '2023-10-26T14:30:00Z'
            }
        ]
    },
    {
        id: 103,
        title: 'Software Update',
        description: 'Need update for Adobe Creative Cloud.',
        category: 'Software',
        priority: 'Low',
        status: 'Closed',
        createdAt: '2023-10-25T09:15:00Z',
        userId: 2,
        messages: [
            {
                sender: 'user',
                message: 'Need update for Adobe Creative Cloud.',
                timestamp: '2023-10-25T09:15:00Z'
            }
        ]
    },
];

export const MOCK_CATEGORIES = ['Authentication', 'Hardware', 'Software', 'Network', 'Other'];
