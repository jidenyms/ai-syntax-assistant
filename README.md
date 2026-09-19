# Syntax AI

A focused AI writing workspace built with Next.js and the OpenAI Responses API.

## Features

- Rewrite text to be concise, polished, expanded, simplified, or summarized
- Secure server-side OpenAI API calls
- Local document history and autosave
- Responsive dark interface
- One-click apply and copy actions

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add an OpenAI API key to `OPENAI_API_KEY`.
4. Run `npm run dev`.

The API key is used only by the server route and is never exposed to the browser.
