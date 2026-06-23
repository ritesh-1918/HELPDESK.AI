from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import engine, Base
import logging

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    """
    Perform startup checks and validations.
    """
    logger.info("Starting application...")
    
    # Validate critical environment variables
    try:
        # This will trigger Pydantic validation
        _ = settings.SECRET_KEY
        _ = settings.JWT_SECRET
        _ = settings.DATABASE_URL
        logger.info("Environment variables validated successfully.")
    except Exception as e:
        logger.error(f"Environment variable validation failed: {e}")
        raise RuntimeError(f"Startup validation failed: {e}")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Database table creation failed: {e}")
        raise RuntimeError(f"Database initialization failed: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down application...")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}
