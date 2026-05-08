# Arcium Private Contact Discovery

An Arcium RTG developer submission for private set intersection on Solana.

## What It Builds
This repo contains an Arcium/Anchor project for encrypted contact matching. Raw phone numbers, emails, and aliases are normalized and hashed locally, then encrypted before computation. Arcium compares encrypted contact batches with registered identifiers and reveals only matches to the requester.

The current generated circuit is the buildable Arcium integration base. The contact-discovery domain layer is documented in `PRIVACY.md`, `DEPLOYMENT.md`, and the Vercel app in `app/`.

## Privacy Benefit
Social apps usually require uploading an entire address book. Arcium enables onboarding that reveals matches without exposing non-matches or raw contact data.

## Arcium Flow
1. Client normalizes and hashes contacts locally.
2. Client encrypts fixed-size batches.
3. Program queues private set-intersection computation.
4. Arcium computes matches privately.
5. Callback writes requester-visible matches only.

## Commands

```bash
yarn install
arcium build
arcium test
```

## Frontend

`app/` is a browser-only contact discovery interface. It accepts real contact input, normalizes identifiers locally, hashes them with SHA-256 through Web Crypto, and compares the result to pasted registered hashes. It does not claim a deployment unless local metadata is present.

To show the verified deployment panel, add one of these JSON files to the static app bundle:

- `app/deployment.json`
- `app/arcium-deployment.json`
- `app/config.json`

Supported fields include `programId`, `network`, `deploymentTx` or `signature`, and `deployedAt`. Without a program id in local metadata, the panel shows `not deployed yet` or `metadata incomplete`.

## RTG Notes
- Functional Solana/Arcium project scaffolded with `arcium init`.
- Open-source repo ready.
- English explanation included.
- Frontend demo included under `app/`.
