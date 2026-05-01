# Arcium Private Contact Discovery

An Arcium RTG developer submission for private set intersection on Solana.

## What It Builds
This repo contains an Arcium/Anchor project for encrypted contact matching. Raw phone numbers, emails, and aliases are normalized and hashed locally, then encrypted before computation. Arcium compares encrypted contact batches with registered identifiers and reveals only matches to the requester.

The current generated circuit is the buildable Arcium integration base. The contact-discovery domain layer is documented in `PRIVACY.md`, `DEPLOYMENT.md`, and the Vercel demo in `app/`.

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

## RTG Notes
- Functional Solana/Arcium project scaffolded with `arcium init`.
- Open-source repo ready.
- English explanation included.
- Frontend demo included under `app/`.
