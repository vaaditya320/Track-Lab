# Contributing to TrackLab

Thank you for your interest in improving TrackLab. This document explains how to set up the project locally, what we expect from contributions, and how to open issues and pull requests.

## Prerequisites

- **Node.js** (LTS recommended)
- **npm**
- **PostgreSQL** database (local or hosted)
- A **Google OAuth** client (for sign-in) and other credentials as described in the [README](./README.md)

## Getting started

1. **Fork** the repository, then **clone** your fork (replace with your GitHub username and repo name if different):
   ```bash
   git clone https://github.com/<your-username>/Track-Lab.git
   cd TrackLab
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment:** Copy or create a `.env` file using the variables listed in the [README](./README.md). Never commit secrets.
4. **Database:** Configure `DATABASE_URL`, then apply Prisma migrations (if the repo includes them) and generate the client:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
   Adjust commands if your workflow uses `db push` for local dev instead.
5. **Run the app:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Before you submit a pull request

- **Lint:** `npm run lint`
- **Build:** `npm run build` (catches many Next.js and type issues)
- **Small, focused changes:** One logical change per PR is easier to review than a large mixed refactor unless discussed first.
- **Match existing style:** Follow patterns in nearby files (imports, naming, MUI usage, API route structure).
- **API changes:** If you add or change HTTP endpoints, update [`api-doc.md`](./api-doc.md) in the same PR.
- **Database changes:** Include Prisma schema/migration updates when needed; describe breaking changes in the PR.

## Branching and commits

- Use a descriptive branch name, e.g. `fix/login-redirect`, `feat/admin-pagination`, `docs/api-users`.
- Write clear commit messages (imperative mood is fine: “Add load more to admin users”).

## Pull requests

1. Open a PR against the default branch (usually `main`).
2. Fill in the [pull request template](.github/pull_request_template.md) (GitHub will show it automatically).
3. Link related issues with `Fixes #123` or `Refs #123` in the description when applicable.
4. Respond to review feedback; maintainers may merge, request changes, or close with an explanation.

## Reporting issues

- Use the [bug report](.github/ISSUE_TEMPLATE/bug_report.yml) or [feature request](.github/ISSUE_TEMPLATE/feature_request.yml) templates when possible.
- Include steps to reproduce for bugs, and expected vs actual behavior.
- Do **not** post passwords, API keys, or personal data in public issues.

## Code of conduct

All participants are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Questions

If something in this guide is unclear or outdated, open an issue or start a discussion so we can improve it.
