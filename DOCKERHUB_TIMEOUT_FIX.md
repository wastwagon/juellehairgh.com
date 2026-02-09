# Docker Hub TLS timeout on Coolify deploy

## The error

```text
failed to resolve source metadata for docker.io/library/node:18-alpine: failed to do request: Head "https://registry-1.docker.io/v2/library/node/manifests/18-alpine": net/http: TLS handshake timeout
```

This means the **server where Coolify runs** cannot reach Docker Hub (`registry-1.docker.io`) when pulling the base image. It is a **network/infrastructure issue on the VPS**, not a bug in your app or Dockerfile.

## What to do

### 1. Retry the deployment

Often the timeout is temporary. In Coolify, click **Redeploy** and try again (maybe 2–3 times at different times).

### 2. Check server network

On the Coolify/VPS server:

- Ensure outbound HTTPS (port 443) to `registry-1.docker.io` is allowed (no firewall or proxy blocking it).
- If you use a proxy, configure Docker to use it (e.g. `HTTP_PROXY` / `HTTPS_PROXY` for the Docker daemon or build).

### 3. Use a Docker registry mirror (if you have one)

If your host or provider gives you a mirror for Docker Hub (e.g. `mirror.example.com`), you can point the Dockerfile at it.

- In Coolify, add a **build argument** for the frontend service:
  - Name: `NODE_BASE_IMAGE`
  - Value: `your-mirror.com/library/node:18-alpine`  
  (replace with the actual mirror URL and path they provide.)

The Dockerfile is set up to use `NODE_BASE_IMAGE` for both build and run stages, so this will pull Node from the mirror instead of Docker Hub.

### 4. Configure Docker daemon on the server (mirror / registry config)

If your host uses a Docker Hub mirror or custom registry config, it’s usually set in the Docker daemon (e.g. `/etc/docker/daemon.json`) with `registry-mirrors` or `insecure-registries`. Apply the config and restart Docker, then redeploy. Exact steps depend on your OS and how Coolify is installed.

---

**Summary:** The failure is from the server not reaching Docker Hub. Fix it by improving connectivity (retry, firewall, proxy) or by using a mirror and the `NODE_BASE_IMAGE` build arg.
