# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Docker Deployment for Unraid (Self-Hosted)

This application is configured for easy, self-hosted deployment using Docker Compose, which is ideal for a server environment like Unraid. Below is a ready-to-use `docker-compose.yml` file for deploying Expensy.

For more details on Unraid and Docker, see the official [Unraid Docker Guide](https://docs.unraid.net/unraid-os/manual/docker-management/).

### 1. Docker Compose Setup

Copy the `docker-compose.yml` file from this repository to your Unraid server (e.g., to a new `expensy` directory within your `/mnt/user/appdata/` share).

Alternatively, you can create the file yourself with the following content:

```yaml
version: '3.8'

services:
  expensy:
    # This tells Docker to build the image from the Dockerfile
    # in the current directory.
    build: .
    container_name: expensy
    restart: always
    ports:
      # Maps port 9002 on your Unraid server to port 3000 inside the container
      # You can change 9002 to any other unused port.
      - "9002:3000"
    environment:
      # Timezone for the container
      - TZ=Etc/UTC
      # You can add other environment variables here if needed
      # - EXAMPLE_VARIABLE=example_value
volumes:
  # This creates a named volume to persist application data.
  # For a Next.js app, this might not be strictly necessary unless
  # you are storing data on the filesystem that needs to persist
  # between container restarts.
  - expensy-data:/app/.next/cache

volumes:
  expensy-data:
    driver: local

```

### 2. Launching the Container

1.  **Clone the Repository**: First, you need to get the application code onto your Unraid server. You can do this by cloning your project's repository. If you don't have the `git` command available, you can install it via the "Nerd Tools" plugin from the Community Applications catalog.
    ```bash
    git clone https://github.com/your-username/your-repository.git /mnt/user/appdata/expensy
    ```
    Navigate into the new directory:
    ```bash
    cd /mnt/user/appdata/expensy
    ```

2.  **Start the Container**: Run the following command to build the image and start the container in the background.
    ```bash
    docker-compose up --build -d
    ```
    *   `--build` tells Docker Compose to build the image from your `Dockerfile` the first time you run it.
    *   `-d` runs the container in detached mode.

3.  **Access Your App**: You can now access your Expensy application in your browser at `http://<your-unraid-ip>:9002`.

### 3. Updating the Application

When you make changes to your application and push them to your repository, you can update your running container with these steps:

1.  **Pull the latest changes** from your repository:
    ```bash
    cd /mnt/user/appdata/expensy
    git pull
    ```

2.  **Rebuild and restart the container** with the updated code:
    ```bash
    docker-compose up --build -d
    ```

Docker Compose will intelligently rebuild the image and restart the container only if it detects changes in your application files.
