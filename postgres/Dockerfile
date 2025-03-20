# Use official PostgreSQL image
FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_USER=biomarker_user
ENV POSTGRES_PASSWORD=securepass123
ENV POSTGRES_DB=biomarker_db

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/
COPY seed.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432

# Mount persistent storage
VOLUME /var/lib/postgresql/data

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB