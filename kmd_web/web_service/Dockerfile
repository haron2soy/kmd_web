# meteo/backend/Dockerfile
FROM python:3.11

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Replace all apt URLs to https and update sources
RUN sed -i 's|http://|https://|g' /etc/apt/sources.list.d/debian.sources \
    && apt-get clean \
    && apt-get update -o Acquire::CompressionTypes::Order::=gz \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gdal-bin \
        libgdal-dev \
        libproj-dev \
        libgeos-dev \
        libhdf5-dev \
        libnetcdf-dev \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies
COPY requirements1.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements1.txt

# Copy Django project (your manage.py and config folder)
COPY . .

# Gunicorn entrypoint
CMD ["gunicorn", "rsmc_config.config.wsgi:application", "--bind", "0.0.0.0:8000"]
