# CXShop Container Deployment

The container directory follows the guarded CXApp deployment pattern.

The current repository has no application runtime. Deployment commands stop until the runtime Compose file exists.

## Files

- `deploy.env.sample` contains shareable deployment defaults.
- `deploy.env` contains private deployment values and stays ignored.
- `prepare-env.sh` creates or validates `deploy.env`.
- `deploy.sh` validates configuration before a deployment.
- `smoke-test.sh` checks the declared runtime after implementation.
- `scripts/common.sh` contains shared validation.

## Prepare configuration

```bash
bash prepare-env.sh
```

Review `.container/deploy.env` before deployment.

## Deploy

```bash
bash setup.sh
```

This command will remain blocked until `.container/runtime/docker-compose.yml` exists.
Do not claim a container deployment before the Compose stack and smoke checks pass.
