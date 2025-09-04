# 1. Base Image: Use an official Node.js runtime as a parent image.
# We use the alpine variant for a smaller image size.
FROM node:20-alpine AS base

# 2. Set Working Directory: Create a directory where our app will live.
WORKDIR /app

# 3. Install Dependencies: Copy package files and install dependencies.
# We copy these first to leverage Docker's layer caching.
COPY package.json ./
RUN npm install

# 4. Copy Application Code: Copy the rest of your app's source code.
COPY . .

# 5. Build the Application: Run the Next.js build command.
# The `next.config.js` is already configured with `output: 'standalone'`,
# which creates an optimized, production-ready server.
RUN npm run build

# --- Production Stage ---
# 6. Production Image: Use a minimal Node.js image for the final container.
FROM node:20-alpine AS production

WORKDIR /app

# 7. Copy Standalone Output: Copy the optimized standalone server from the build stage.
# This includes only the necessary files to run the app, keeping the image small.
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./

# 8. Expose Port: The Next.js server runs on port 3000 by default.
EXPOSE 3000

# 9. Start the Server: The command to start the application.
CMD ["node", "server.js"]
