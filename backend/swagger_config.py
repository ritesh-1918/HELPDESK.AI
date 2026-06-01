"""
Swagger UI Custom Styling for AI Helpdesk Backend

This module provides custom CSS and JavaScript for Swagger UI to match
the AI Helpdesk brand identity and improve developer experience.
"""

SWAGGER_UI_CUSTOM_CSS = """
/* AI Helpdesk Swagger UI Custom Theme */

/* Header bar */
.swagger-ui .topbar {
    background-color: #1a1a2e;
    border-bottom: 3px solid #4361ee;
}

.swagger-ui .topbar .download-url-wrapper .download-url-input {
    border: 2px solid #4361ee;
    border-radius: 4px;
}

/* Title */
.swagger-ui .info .title {
    color: #1a1a2e;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 2em;
    font-weight: 700;
}

.swagger-ui .info .description p {
    color: #4a5568;
    font-size: 14px;
    line-height: 1.6;
}

/* Section headers */
.swagger-ui .opblock-tag {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
}

.swagger-ui .opblock-tag:hover {
    color: #4361ee;
    border-bottom-color: #4361ee;
}

/* Operation blocks */
.swagger-ui .opblock {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.swagger-ui .opblock:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* GET operations */
.swagger-ui .opblock.opblock-get {
    background: rgba(72, 187, 120, 0.04);
    border-color: #48bb78;
}

.swagger-ui .opblock.opblock-get .opblock-summary-method {
    background: #48bb78;
}

/* POST operations */
.swagger-ui .opblock.opblock-post {
    background: rgba(67, 97, 238, 0.04);
    border-color: #4361ee;
}

.swagger-ui .opblock.opblock-post .opblock-summary-method {
    background: #4361ee;
}

/* PUT operations */
.swagger-ui .opblock.opblock-put {
    background: rgba(237, 137, 54, 0.04);
    border-color: #ed8936;
}

.swagger-ui .opblock.opblock-put .opblock-summary-method {
    background: #ed8936;
}

/* DELETE operations */
.swagger-ui .opblock.opblock-delete {
    background: rgba(245, 101, 101, 0.04);
    border-color: #f56565;
}

.swagger-ui .opblock.opblock-delete .opblock-summary-method {
    background: #f56565;
}

/* Method badges */
.swagger-ui .opblock .opblock-summary-method {
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    padding: 6px 12px;
    min-width: 70px;
    text-align: center;
}

/* Parameters */
.swagger-ui .parameter__name {
    font-weight: 600;
    color: #2d3748;
}

.swagger-ui .parameter__name.required::after {
    color: #f56565;
    font-size: 12px;
}

/* Models */
.swagger-ui section.models {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
}

.swagger-ui section.models .model-container {
    background: #f7fafc;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
}

/* Try it out button */
.swagger-ui .try-out__btn {
    border: 2px solid #4361ee;
    color: #4361ee;
    border-radius: 6px;
    font-weight: 600;
}

.swagger-ui .try-out__btn:hover {
    background: #4361ee;
    color: white;
}

/* Execute button */
.swagger-ui .btn.execute {
    background: #4361ee;
    border-color: #4361ee;
    border-radius: 6px;
    font-weight: 600;
}

.swagger-ui .btn.execute:hover {
    background: #3a56d4;
}

/* Response section */
.swagger-ui .responses-inner {
    padding: 12px;
}

.swagger-ui .responses-table {
    border-radius: 6px;
    overflow: hidden;
}

/* Code blocks */
.swagger-ui .highlight-code {
    border-radius: 6px;
    overflow: hidden;
}

/* Authorize button */
.swagger-ui .btn.authorize {
    color: #4361ee;
    border-color: #4361ee;
    border-radius: 6px;
}

.swagger-ui .btn.authorize:hover {
    background: #4361ee;
    color: white;
}

/* Scheme selector */
.swagger-ui .scheme-container {
    background: #f7fafc;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e2e8f0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: #a0aec0;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #718096;
}

/* Footer */
.swagger-ui .info .link {
    color: #4361ee;
}

.swagger-ui .info .link:hover {
    color: #3a56d4;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .swagger-ui .opblock .opblock-summary {
        flex-direction: column;
        align-items: flex-start;
    }

    .swagger-ui .opblock .opblock-summary-method {
        margin-bottom: 8px;
    }
}
"""

SWAGGER_UI_CUSTOM_JS = """
// AI Helpdesk Swagger UI Custom JavaScript

// Add custom header with branding
document.addEventListener('DOMContentLoaded', function() {
    // Add version badge
    const info = document.querySelector('.swagger-ui .info');
    if (info) {
        const versionBadge = document.createElement('span');
        versionBadge.style.cssText = `
            background: #4361ee;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 12px;
            vertical-align: middle;
        `;
        versionBadge.textContent = 'v1.0.0';
        const title = info.querySelector('.title');
        if (title) {
            title.appendChild(versionBadge);
        }
    }

    // Add environment selector
    const topbar = document.querySelector('.swagger-ui .topbar');
    if (topbar) {
        const envSelector = document.createElement('div');
        envSelector.style.cssText = `
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        envSelector.innerHTML = `
            <select id="env-selector" style="
                padding: 6px 12px;
                border: 1px solid #4361ee;
                border-radius: 4px;
                background: white;
                color: #1a1a2e;
                font-size: 13px;
            ">
                <option value="local">Local Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
            </select>
        `;
        topbar.appendChild(envSelector);

        // Add change handler to switch API server
        const selector = envSelector.querySelector('#env-selector');
        const envUrls = {
            local: window.location.origin,
            staging: 'https://staging-api.helpdesk.ai',
            production: 'https://api.helpdesk.ai'
        };
        selector.addEventListener('change', function() {
            const env = this.value;
            const baseUrl = envUrls[env] || envUrls.local;
            if (window._swaggerUi) {
                window._swaggerUi.specActions.updateUrl(baseUrl + '/openapi.json');
                window._swaggerUi.specActions.download();
            }
        });
    }
});

// Auto-collapse models section
setTimeout(function() {
    const models = document.querySelector('.swagger-ui section.models');
    if (models) {
        const toggle = models.querySelector('h4');
        if (toggle) {
            toggle.click();
        }
    }
}, 500);
"""
