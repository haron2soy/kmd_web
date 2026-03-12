FROM nginx:stable-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom config
COPY docker/nginx/rsmc.conf /etc/nginx/conf.d/rsmc.conf

# Copy proxy_params into the container
COPY docker/nginx/proxy_params /etc/nginx/proxy_params

# Expose port 80/443
EXPOSE 80 443
