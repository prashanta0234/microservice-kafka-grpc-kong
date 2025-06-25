# Use Node.js 18 Alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose ports
EXPOSE 3001 5000

# Start the application
CMD ["npm", "run", "start:prod"] 