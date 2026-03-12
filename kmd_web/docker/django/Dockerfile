FROM python:3.11-slim-bookworm

# System deps
RUN apt-get update && apt-get install -y \
   --no-install-recommends \
	build-essential libpq-dev curl && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy requirements first for caching
COPY ../../requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django project
COPY ../../web_service /app

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port for Gunicorn
EXPOSE 8000

# Run Gunicorn
CMD ["gunicorn", "rsmc_config.config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
