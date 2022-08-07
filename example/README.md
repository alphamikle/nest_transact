To run project you should install docker, then run command:

```bash
npm install
```

After installation of dependencies was complete, do this:

```bash
npm run docker:pg
```

to run PostgreSQL in docker

or

```bash
npm run docker:mssql
```

to run MySQL in docker.

After that, run corresponding command:

```bash
npm run start:pg
```

or

```bash
npm run start:mssql
```

OpenAPI Specifications for running requests is available at `localhost:3000/api`.

Also, the simplest way to check, that everything is working as expect, just run:

```bash
npm install
npm run test
```