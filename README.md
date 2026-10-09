# Docker To-Do Practice

A small Express and MongoDB to-do list application used to practice Docker, Docker Compose, container networking, persistent volumes, image registries, and GitHub Actions CI.

## What is included

- Express API for listing, creating, and deleting to-dos
- Plain HTML frontend served by Express
- MongoDB persistence through Mongoose
- Docker image based on `node:18-alpine`
- Docker Compose setup with an app service and a MongoDB service
- Named `mongo-data` volume so data survives container recreation
- Node's built-in `assert` module test suite
- GitHub Actions workflow that builds, tests, tags, and pushes the image to GHCR

## Prerequisites

Install the following before running the project:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 18 or newer, if running tests or the server outside Docker
- Git, if you want to push changes to GitHub

Make sure Docker Desktop is open and its Linux engine is running.

## Run with Docker Compose

This is the recommended way to run the complete application because it starts both the app and MongoDB on the same Docker network.

```bash
docker compose up --build
```

Open <http://localhost:5000> in a browser.

Run in the background:

```bash
docker compose up --build -d
```

Check the services and logs:

```bash
docker compose ps
docker compose logs -f app
```

Stop the services while keeping MongoDB data:

```bash
docker compose down
```

Stop the services and delete the MongoDB volume and all saved to-dos:

```bash
docker compose down -v
```

The Compose file gives the app the database URL `mongodb://db:27017/todos`. The hostname is `db` because Compose provides service-name DNS on its private network. Do not change it to `localhost` inside the Compose configuration.

## Run locally without Docker

Running the Node server directly requires a MongoDB instance at `mongodb://localhost:27017/todos`, unless `MONGO_URL` is set to another connection string.

Install dependencies and start the server:

```bash
npm install
npm start
```

The server listens on <http://localhost:5000> by default. You can change the port or database URL with environment variables:

```powershell
$env:PORT = "5050"
$env:MONGO_URL = "mongodb://localhost:27017/todos"
npm start
```

## Run tests

The tests do not require MongoDB or a running server.

```bash
npm test
```

The test suite checks `isValidTodoText` in `utils.js` for valid, empty, whitespace-only, and non-string values.

## Build and run the image manually

Build the image from the project root, where the `Dockerfile` is located:

```bash
docker build -t todo-practice .
```

Run it with the app port published to the host:

```bash
docker run --rm -p 5000:5000 --name todo-solo todo-practice
```

The image alone does not contain MongoDB. The page can load, but database operations will fail unless a MongoDB instance is reachable and `MONGO_URL` is configured. This is why Docker Compose is used for the normal workflow.

Useful inspection commands:

```bash
docker images
docker ps
docker ps -a
docker logs todo-solo
docker inspect todo-solo
docker exec -it todo-solo sh
```

## API endpoints

| Method   | Path         | Description                             |
| -------- | ------------ | --------------------------------------- |
| `GET`    | `/todos`     | Return all to-dos, newest first         |
| `POST`   | `/todos`     | Create a to-do from `{ "text": "..." }` |
| `DELETE` | `/todos/:id` | Delete a to-do by MongoDB id            |

Example request:

```bash
curl -X POST http://localhost:5000/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Learn Docker"}'
```

## GitHub Actions CI

The workflow is located at `.github/workflows/docker-ci.yml` and runs on pushes to `main`.

Each run:

1. Checks out the repository.
2. Builds the `todo-practice` Docker image.
3. Runs `npm test` inside the built image.
4. Creates a local tag using the commit SHA.
5. Logs in to GitHub Container Registry using the automatic `GITHUB_TOKEN`.
6. Pushes `ghcr.io/<owner>/todo-practice:<commit-sha>`.

The workflow needs `packages: write`, which is already declared in the workflow permissions. It does not use a personal access token.

To use the workflow, push to the `main` branch and review the run in the repository's **Actions** tab. The package will appear under the GitHub account's **Packages** section after a successful push.

## Troubleshooting

### Docker daemon connection error

Start Docker Desktop and wait until the Linux engine is ready, then retry the command.

### Port 5000 is already in use

Find containers using published ports:

```bash
docker ps
```

Stop and remove the old container, or use another host port:

```bash
docker run --rm -p 5050:5000 todo-practice
```

### Changes do not appear after rebuilding

A running container keeps using the image it was created from. Stop and remove the old container before starting a new one:

```bash
docker stop todo-solo
docker rm todo-solo
docker run --rm -p 5000:5000 --name todo-solo todo-practice
```

### To-dos disappeared

Run `docker compose down` without `-v` to preserve the named `mongo-data` volume. The `-v` option deletes the volume and its data.

### Compose cannot connect to MongoDB

Check that the app uses `mongodb://db:27017/todos` under Compose and inspect both service logs:

```bash
docker compose logs app db
```

## Project structure

```text
.
├── .github/workflows/docker-ci.yml  # GitHub Actions Docker CI
├── public/index.html                 # Browser UI
├── .dockerignore                     # Docker build exclusions
├── Dockerfile                        # App image definition
├── docker-compose.yml                # App, database, network, and volume
├── package.json                      # Scripts and dependencies
├── package-lock.json                 # Locked dependency versions
├── server.js                         # Express server and MongoDB API
├── test.js                           # Built-in test runner
└── utils.js                          # Todo validation helper
```

## License

This is a practice project and has no production license or deployment guarantee.
