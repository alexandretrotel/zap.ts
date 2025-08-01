# Deployment

Zap.ts is built on **Next.js**, which means you can leverage the full ecosystem of **Next.js** deployment options.

To deploy Zap.ts, refer to the [official Next.js deployment guide](https://nextjs.org/docs/app/getting-started/deploying).

It explains how to deploy a **Next.js** app to platforms like [Digital Ocean](https://www.digitalocean.com/), [Docker](https://www.docker.com/), and more.

## Docker

For [Docker](https://www.docker.com/), a `Dockerfile` and `.dockerignore` are already included—you can modify them as needed.

They were created based on the Next.js recommendations from the documentation above.

Make sure to enable the [standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-traced-files) option in the `next.config.ts` file.