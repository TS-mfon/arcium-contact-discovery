# Privacy Model

## Private
- Raw phone numbers, emails, wallet aliases, and non-matching contacts.
- Full uploaded address book.

## Public
- Registered user handles, discovery request accounts, requester-owned match result, and aggregate match count.

## Arcium Role
Arcium performs private set intersection over encrypted fixed-size batches. The callback reveals only matches to the requester, never the non-matches.
