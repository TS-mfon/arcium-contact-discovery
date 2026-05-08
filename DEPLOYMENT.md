# Deployment

```bash
yarn install
arcium build
arcium test
solana config set --url devnet --keypair ~/.config/solana/arcium-rtg-deployer.json
arcium deploy --cluster-offset 456 --recovery-set-size 4 --rpc-url https://api.devnet.solana.com
```

The client must normalize and hash identifiers locally before encryption. Raw address-book data must never be sent to RPC, logs, or backend services.

## Frontend Deployment Metadata

The app reads local JSON metadata from `app/deployment.json`, `app/arcium-deployment.json`, or `app/config.json`. If none exists, the verified-state panel displays `not deployed yet`.

Example:

```json
{
  "programId": "PROGRAM_PUBLIC_KEY",
  "network": "devnet",
  "deploymentTx": "DEPLOYMENT_SIGNATURE",
  "deployedAt": "2026-05-03T00:00:00Z"
}
```
