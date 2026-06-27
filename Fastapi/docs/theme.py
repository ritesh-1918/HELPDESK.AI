"""
Custom Swagger/OpenAPI theme configuration for HELPDESK.AI.
Provides a clean, corporate-styled API documentation interface.
"""

from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi import FastAPI
from fastapi.responses import HTMLResponse


# Custom CSS for Swagger UI
SWAGGER_CUSTOM_CSS = """
<style>
    /* Corporate dark theme */
    .swagger-ui { background: #1a1a2e !important; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #e94560; font-size: 28px; }
    .swagger-ui .info .description p { color: #ccc; }
    .swagger-ui .scheme-container { background: #16213e; border: 1px solid #0f3460; border-radius: 8px; }
    .swagger-ui .opblock-tag { color: #e94560; border-bottom: 1px solid #0f3460; }
    .swagger-ui .opblock { border: 1px solid #0f3460; border-radius: 8px; margin: 10px 0; }
    .swagger-ui .opblock .opblock-summary { border-radius: 8px 8px 0 0; }
    .swagger-ui .opblock.opblock-get { background: rgba(0, 150, 136, 0.1); border-color: #009688; }
    .swagger-ui .opblock.opblock-get .opblock-summary { background: rgba(0, 150, 136, 0.2); }
    .swagger-ui .opblock.opblock-post { background: rgba(76, 175, 80, 0.1); border-color: #4CAF50; }
    .swagger-ui .opblock.opblock-post .opblock-summary { background: rgba(76, 175, 80, 0.2); }
    .swagger-ui .opblock.opblock-put { background: rgba(255, 152, 0, 0.1); border-color: #FF9800; }
    .swagger-ui .opblock.opblock-put .opblock-summary { background: rgba(255, 152, 0, 0.2); }
    .swagger-ui .opblock.opblock-delete { background: rgba(244, 67, 54, 0.1); border-color: #f44336; }
    .swagger-ui .opblock.opblock-delete .opblock-summary { background: rgba(244, 67, 54, 0.2); }
    .swagger-ui .opblock.opblock-patch { background: rgba(156, 39, 176, 0.1); border-color: #9C27B0; }
    .swagger-ui .opblock.opblock-patch .opblock-summary { background: rgba(156, 39, 176, 0.2); }
    .swagger-ui .btn { border-radius: 4px; }
    .swagger-ui .btn.authorize { color: #4CAF50; border-color: #4CAF50; }
    .swagger-ui .btn.authorize svg { fill: #4CAF50; }
    .swagger-ui table thead tr th { color: #e94560; border-bottom: 1px solid #0f3460; }
    .swagger-ui .response-col_status { color: #4CAF50; }
    .swagger-ui .response-col_links { color: #ccc; }
    .swagger-ui .model-box { background: #16213e; border-radius: 8px; }
    .swagger-ui .model { color: #ccc; }
    .swagger-ui .model-title { color: #e94560; }
    .swagger-ui section.models { border: 1px solid #0f3460; border-radius: 8px; }
    .swagger-ui section.models h4 { color: #e94560; }
    .swagger-ui .parameter__name { color: #e94560; }
    .swagger-ui .parameter__type { color: #4CAF50; }
    .swagger-ui .response-col_description { color: #ccc; }
    .swagger-ui .responses-inner { padding: 10px; }
    .swagger-ui .highlight-code { background: #16213e; border-radius: 4px; }
    .swagger-ui .microlight { background: #0f3460 !important; }
</style>
"""

# Custom CSS for ReDoc
REDOC_CUSTOM_CSS = """
<style>
    body { background: #1a1a2e; color: #ccc; }
    .menu-content { background: #16213e; border-right: 1px solid #0f3460; }
    .menu-item-label { color: #ccc; }
    .menu-item-label:hover { color: #e94560; }
    h1 { color: #e94560; }
    h2 { color: #e94560; border-bottom: 1px solid #0f3460; }
    h3 { color: #4CAF50; }
    a { color: #e94560; }
    code { background: #0f3460; color: #4CAF50; border-radius: 3px; padding: 2px 6px; }
    .http-verb { border-radius: 4px; font-weight: bold; }
    .get { background: #009688; }
    .post { background: #4CAF50; }
    .put { background: #FF9800; }
    .delete { background: #f44336; }
    .patch { background: #9C27B0; }
    table { border-collapse: collapse; }
    th { background: #0f3460; color: #e94560; padding: 8px 12px; text-align: left; }
    td { border-bottom: 1px solid #0f3460; padding: 8px 12px; }
    tr:hover td { background: rgba(233, 69, 96, 0.05); }
</style>
"""


def configure_docs(app: FastAPI):
    """
    Configure custom-themed Swagger UI and ReDoc documentation endpoints.
    
    Usage:
        from docs.theme import configure_docs
        app = FastAPI(title="HELPDESK.AI", ...)
        configure_docs(app)
    """

    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui():
        return get_swagger_ui_html(
            openapi_url=app.openapi_url,
            title=f"{app.title} - API Documentation",
            swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
            swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
            swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
            custom_css=SWAGGER_CUSTOM_CSS,
        )

    @app.get("/redoc", include_in_schema=False)
    async def custom_redoc():
        return get_redoc_html(
            openapi_url=app.openapi_url,
            title=f"{app.title} - API Reference",
            redoc_js_url="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js",
            redoc_favicon_url="https://fastapi.tiangolo.com/img/favicon.png",
            custom_css=REDOC_CUSTOM_CSS,
        )
