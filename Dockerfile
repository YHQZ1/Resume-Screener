FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# --- ADD THIS LINE ---
# This downloads the missing model into the container image
RUN python -m spacy download en_core_web_sm

# Copy the rest of the code
COPY backend/ ./backend/
COPY nlp/ ./nlp/

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]