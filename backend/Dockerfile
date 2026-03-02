# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory to /app
WORKDIR /app

# Install system dependencies required for EasyOCR and OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies (no-cache-dir keeps the docker image smaller)
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the remaining files into the container as a 'backend' directory
# This allows absolute imports like 'from backend.services...' to work perfectly
COPY . /app/backend

# Tell Python where to look for modules (so it can find the 'backend' folder)
ENV PYTHONPATH=/app

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Run the FastAPI server via Uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
