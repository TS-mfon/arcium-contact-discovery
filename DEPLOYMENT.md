# Deployment

```bash
yarn install
arcium build
arcium test
solana config set --url devnet --keypair ~/.config/solana/arcium-rtg-deployer.json
arcium deploy --cluster-offset 456 --recovery-set-size 4 --rpc-url https://api.devnet.solana.com
```

The client must normalize and hash identifiers locally before encryption. Raw address-book data must never be sent to RPC, logs, or backend services.
