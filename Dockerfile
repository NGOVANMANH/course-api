# syntax=docker/dockerfile:1

# Use Node.js Alpine version for a smaller image
ARG NODE_VERSION=22.9.0
FROM node:${NODE_VERSION}-alpine

# Set production environment by default
ENV NODE_ENV production

# Create and set working directory
WORKDIR /usr/src/app

# Copy only package.json and yarn.lock to optimize caching
COPY package.json yarn.lock ./

# Install dependencies (using cache for faster subsequent builds)
RUN yarn install --production --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Ensure node user owns the app directory (security measure)
RUN chown -R node:node /usr/src/app

# Use non-root user for security
USER node

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
