# Arcium Usage and Privacy Benefits

## Project

Arcium Contact Discovery is a Solana dapp for private friend and contact discovery. It is designed for the common onboarding flow where a user wants to find existing contacts without uploading or exposing an entire address book.

## How Arcium Is Used

The dapp is designed around Arcium confidential computation and private set intersection. Wallet authorization and action receipts happen on Solana, while contact identifiers are treated as private inputs.

The intended Arcium flow is:

1. A user connects a Solana wallet.
2. The user enters an email, phone number, handle, wallet alias, or contact identifier.
3. The raw identifier is normalized locally and should not be stored as readable public state.
4. The frontend submits a wallet-signed Solana transaction to the deployed Arcium program, creating an explorer-verifiable action receipt.
5. Discovery requests compare private contact sets through Arcium-style confidential computation.
6. Only matches should be revealed. Non-matching contacts should remain hidden.

The deployed MVP includes a live Solana program instruction for wallet-signed action receipts. The transaction proves that a registration or discovery action happened, but it intentionally does not publish the raw email, phone number, or contact list.

## Privacy Benefits

Normal contact discovery requires uploading an address book to a server or publishing identifiers that can be linked to a wallet. That leaks non-matches, social graph data, and sensitive personal identifiers.

Using Arcium improves the design because:

- Raw emails and phone numbers do not need to appear on-chain.
- Users can prove they submitted a discovery action without exposing the contact list.
- Matching can reveal only overlapping contacts.
- Non-matches remain private.
- The dapp can support friend discovery without building a centralized address-book database.

## Why A Registered Contact Does Not Reappear Publicly

If a user registers `alice@example.com`, the dapp should not later display that raw email from the chain. That would defeat the purpose of private contact discovery.

The correct behavior is:

- The wallet signs a transaction.
- The program records an action receipt or commitment.
- The explorer can verify the transaction happened.
- The raw email remains private.
- A match should appear only after a discovery/matching computation produces a result that is allowed to be revealed.

If the UI does not show a match after signing, that is normal unless a matching discovery request has been computed and finalized. The signed registration transaction is not the same thing as a match result.
