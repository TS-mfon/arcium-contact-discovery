# Arcium Private Contact Discovery

Private contact discovery dapp for Solana and Arcium. The app lets a user register a private identifier, submit a contact list for discovery, and view locally revealed matches.

## Live Status

- Network: Solana devnet
- Program: `2cWbFVSzasSV2JgBmZNdK7NK3Le9WwNGQerMgbz5eHfq`
- Frontend: https://arciumcontactdiscovery.vercel.app

## Fuller Dapp Flow

1. Connect a Solana wallet.
2. Register an email, phone number, handle, or alias.
3. The browser normalizes and hashes the identifier locally.
4. Submit a discovery request with a pasted contact list.
5. The matches page/private workspace shows only locally matched identifiers and links every action to an explorer-confirmed transaction.

Every form sends a real wallet-signed transaction to the deployed program. The UI keeps the raw identifier only in browser local storage so the user can see their own match result without publishing the email or phone number on-chain.

## How Arcium Is Used

Arcium is the confidential-computation layer for private set intersection. The intended production flow compares encrypted or secret-shared contact sets and reveals only overlap between the requester and registered identifiers.

The MVP program records explorer-verifiable action receipts. The frontend now provides a fuller local matching workflow so users can understand the privacy model: raw contacts remain local, commitments are linked to signed actions, and only matches are shown.

## Privacy Benefits

- Raw emails and phone numbers do not need to be public.
- Non-matching contacts are not revealed.
- The user can verify that a registration or discovery action happened on-chain.
- The social graph is not uploaded as a readable public list.

## Why Your Saved Email Does Not Automatically Appear On-Chain

If you register `alice@example.com`, the app should not load that raw email from Solana after signing. Publishing it back from chain would defeat private contact discovery.

The browser may show your own email again because it was saved locally for your wallet. A match appears when a discovery request includes a contact that hashes to a locally registered identifier. The chain stores the signed receipt; the raw contact stays local.

## Local Versus On-Chain Data

The transaction receipt is on-chain. The raw contact and local match list are stored in browser local storage for the connected wallet. Clearing browser storage removes the local match view but does not remove the Solana transaction.

## Commands

```bash
yarn install
arcium build
arcium test
```
