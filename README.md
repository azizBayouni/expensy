# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Docker Deployment

This application includes a `Dockerfile` to make it easy to build and deploy as a Docker container, suitable for hosting on services like Unraid.

### Building the Docker Image

To build the production Docker image, run the following command from the root of the project:

```bash
docker build -t expensy .
```

### Running the Docker Container

Once the image is built, you can run it as a container:

```bash
docker run -p 3000:3000 expensy
```

This will start the application, and it will be accessible at `http://localhost:3000` on your host machine.

### Unraid Deployment

On your Unraid server, you can add this application as a new Docker container:

1.  Navigate to the "Docker" tab in your Unraid web UI.
2.  Click "Add Container".
3.  Set the **Repository** to the name you used when building the image (e.g., `expensy`).
4.  Set the **WebUI Port** to map the container's port `3000` to a host port of your choice (e.g., `8080`). You would access it via `http://<your-unraid-ip>:8080`.
5.  You can add any required environment variables under "Advanced View".
6.  Click "Apply" to start the container.
