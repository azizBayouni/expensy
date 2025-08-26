# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Docker Deployment for Unraid (Professional Workflow)

This application is configured for professional, automated deployment using Docker, suitable for a server environment like Unraid. The recommended workflow involves using a CI/CD pipeline (like GitHub Actions) to automatically build the Docker image and push it to a registry (like Docker Hub). Unraid can then pull the latest image directly from the registry.

This setup allows you to manage deployments and updates entirely from the Unraid UI after the initial configuration.

### 1. Prerequisites

*   A [GitHub](https://github.com/) account for your project repository.
*   A [Docker Hub](https://hub.docker.com/) account to store your built images.

### 2. Automated Builds with GitHub Actions

You will need to set up a GitHub Actions workflow to build and publish your Docker image.

1.  **Add Docker Hub Credentials to GitHub Secrets:**
    *   In your GitHub repository, go to `Settings` > `Secrets and variables` > `Actions`.
    *   Create a new repository secret named `DOCKERHUB_USERNAME` with your Docker Hub username.
    *   Create another new repository secret named `DOCKERHUB_TOKEN` with a Docker Hub access token. You can generate one in your Docker Hub account settings.

2.  **Create the Workflow File:**
    *   Create a directory path `.github/workflows/` in your project's root.
    *   Inside that directory, create a new file named `docker-publish.yml`.
    *   Add the following content to `docker-publish.yml`. Remember to replace `your-dockerhub-username/expensy` with your actual Docker Hub username and desired image name.

    ```yaml
    name: Docker Image CI

    on:
      push:
        branches: [ "main" ] # Or your primary branch

    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v3
        - name: Set up Docker Buildx
          uses: docker/setup-buildx-action@v2
        - name: Login to Docker Hub
          uses: docker/login-action@v2
          with:
            username: ${{ secrets.DOCKERHUB_USERNAME }}
            password: ${{ secrets.DOCKERHUB_TOKEN }}
        - name: Build and push
          uses: docker/build-push-action@v4
          with:
            context: .
            file: ./Dockerfile
            push: true
            tags: your-dockerhub-username/expensy:latest
    ```

Now, whenever you push changes to your `main` branch, GitHub Actions will automatically build the Docker image and push it to your Docker Hub repository.

### 3. Unraid Deployment from the UI

1.  **Install Community Applications (if you haven't already):** This plugin makes finding and managing Docker containers easier.
2.  **Add Your Application:**
    *   Navigate to the **Apps** tab in your Unraid web UI.
    *   Search for your application by the Docker Hub repository name (e.g., `your-dockerhub-username/expensy`).
    *   If it doesn't appear (it won't initially as it's not a standard template), you can add it manually. Go to the **Docker** tab.
    *   Click **Add Container**.
    *   Set the **Name** for your container (e.g., `Expensy`).
    *   For the **Repository**, enter the full name of your image on Docker Hub (e.g., `your-dockerhub-username/expensy:latest`).
    *   Set the **WebUI Port**: Map the container's port `3000` to a host port of your choice (e.g., `8080`). You will access your app via `http://<your-unraid-ip>:8080`.
    *   You can add any required environment variables under "Advanced View".
    *   Click **Apply** to pull the image and start the container.

### 4. Updating the Application

To update your application to the latest version after pushing changes to GitHub:

1.  Go to the **Docker** tab in Unraid.
2.  Find your `Expensy` container.
3.  Click on it and select **Check for Updates**.
4.  If an update is found, Unraid will prompt you to apply it. This pulls the new image from Docker Hub and restarts the container with the latest version of your app.
