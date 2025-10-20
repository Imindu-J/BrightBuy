# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY backend/ .

# Create directory for images if it doesn't exist
RUN mkdir -p public/images

# Expose port
EXPOSE 5000

# Set environment variables for development
ENV NODE_ENV=development

# Start the application with nodemon for development
CMD ["npm", "run", "dev"]