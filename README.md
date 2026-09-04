## Minitroopers

This is the repository for Minitroopers!

[Roadmap](https://gitlab.com/eternaltwin/minitroopers/minitroopers/-/wikis/Roadmap)

## Frontend

> Made with [Angular 22](https://angular.dev/) and [TailwindCSS](https://tailwindcss.com/).

## Backend

> Made with [Node.js](https://nodejs.org/en/) (>= 22.22.3), [ExpressJS](https://expressjs.com/) 5, [Prisma](https://prisma.io/) 7, written in [Typescript](https://www.typescriptlang.org/).

## Contributing

### Manual setup

- Fork this project
- Use Node.js **22.22.3+** (see `engines` in `package.json`)
- Setup your local Postgres databases (minitroopers + [eternaltwin](https://gitlab.com/eternaltwin/eternaltwin/-/blob/master/docs/db.md))
- Copy `.env.example` to `.env` and adapt the variables
- Copy `eternaltwin.toml.example` to `eternaltwin.toml` and adapt the variables
- Edit `apps/client/src/environments` for production URLs
- Install dependencies: `npm install` (runs `prisma generate` via postinstall)
- Apply database migrations: `npm run prisma:deploy` (or `npm run prisma:migrate` in dev)
- Deploy SWF/Ruffle assets:
  - Place `client_fr_edit.swf` and set `SWF_PATH` in `.env`
  - Ensure `apps/server/src/bin/ruffle_desktop` (or `.exe` on Windows) is present
- Start etwin local: `npm run eternaltwin:start`
- Start project: `npm run turbo:dev`
- Commit and push your changes
- Create a pull request to merge your fork into `main`

### Useful scripts

| Script | Description |
|--------|-------------|
| `npm run turbo:dev` | Start client + server in dev |
| `npm run turbo:build` | Build all workspaces |
| `npm run turbo:lint` | Lint all workspaces |
| `npm run typecheck` | Typecheck shared + server |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Create/apply dev migrations |
| `npm run prisma:deploy` | Apply migrations in production |

### Production checklist

- Set `NODE_ENV=production`
- Set `DISABLE_GAME_LIMITS=false`
- Set `TRUST_PROXY=true` behind a reverse proxy
- Run `npm run prisma:deploy` before starting the server

## File Structure

```text
.
├── apps
│   ├── client        # Frontend (Angular)
│   └── server        # Backend (ExpressJS)
│
├── packages
│   ├── prisma        # Prisma schema, migrations, generated client
│   └── shared        # Shared domain types and game logic
│
└── node_modules      # Node modules
```
