export interface User {
    id: string;
    email?: string;
}

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: 'user' | 'admin' | 'master_admin';
    status: 'active' | 'pending_email_verification' | 'suspended';
    company: string;
    profile_picture?: string;
}

export interface Ticket {
    ticket_id: string;
    id?: string;
    subject?: string;
    summary?: string;
    description?: string;
    status: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    category: string;
    subcategory?: string;
    assigned_team?: string;
    company?: string;
    created_at?: string;
    createdAt?: string;
    timestamp?: string;
    creator?: Profile;
    profiles?: Profile;
    user_name?: string;
    correction?: {
        corrected_category?: string;
        corrected_subcategory?: string;
        corrected_priority?: string;
    };
    reassigned_at?: string;
    messages?: Array<{
        sender: string;
        message: string;
        timestamp: string;
    }>;
}

export interface AIAnalysisResult {
    category: string;
    subcategory: string;
    priority: string;
    assigned_team: string;
    auto_resolve: boolean;
    confidence: number;
    duplicate_ticket: {
        similarity: number;
        duplicate_ticket_id?: string;
    };
    summary: string;
    entities: string[];
    reasoning: string;
    decision_factors: string[];
    image_description?: string;
    ocr_text?: string;
}
