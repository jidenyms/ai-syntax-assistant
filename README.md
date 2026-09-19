# Syntax AI

A focused AI writing workspace built with Next.js, Vercel AI Gateway, and OpenAI models.

## Features

- Rewrite text to be concise, polished, expanded, simplified, or summarized
- Secure server-side AI Gateway calls with Vercel OIDC
- Local document history and autosave
- Responsive dark interface
- One-click apply and copy actions

## Local development

1. Install dependencies with `npm install`.
2. Link the project with Vercel and pull the development environment.
3. Run `npm run dev`.

Production deployments authenticate to Vercel AI Gateway using a short-lived OIDC token, so no OpenAI API key is exposed to the browser or stored in the repository.
