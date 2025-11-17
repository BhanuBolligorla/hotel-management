# Use Nginx image
FROM nginx:alpine

# Copy React build to Nginx html folder
COPY build/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
