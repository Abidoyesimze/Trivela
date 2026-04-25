# Deployment & Restart Policy Guidance

## Docker Healthcheck

The backend container includes a healthcheck that monitors the `/health` endpoint. The healthcheck:
- Probes every 30 seconds
- Waits up to 3 seconds for a response
- Allows 5 seconds after startup before considering the container unhealthy
- Marks the container unhealthy after 3 consecutive failed checks

A healthy container returns `{"status": "ok"}` from `GET /health`. Any other status or timeout marks the container as unhealthy.

## Restart Policies

Choose a restart policy appropriate for your deployment platform:

### Docker Compose

```yaml
services:
  backend:
    build: .
    restart_policy:
      condition: on-failure
      max_retries: 3
      delay: 5s
```

This restarts the container on non-zero exit or unhealthy status, with a 5-second delay between attempts and a max of 3 retries.

### Kubernetes

```yaml
spec:
  containers:
    - name: backend
      image: trivela-backend:latest
      livenessProbe:
        httpGet:
          path: /health
          port: 3001
        initialDelaySeconds: 10
        periodSeconds: 30
        timeoutSeconds: 3
        failureThreshold: 3
  restartPolicy: Always
```

This uses the built-in healthcheck via liveness probe and restarts the pod on failure.

### Docker Swarm

```yaml
version: '3.8'
services:
  backend:
    image: trivela-backend:latest
    deploy:
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

Similar to Docker Compose, restarts on failure with exponential backoff.
