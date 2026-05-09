use anchor_lang::prelude::*;

#[account]
pub struct IdentifierCommitment {
    pub owner: Pubkey,
    pub commitment_id: u64,
    pub commitment_hash: [u8; 32],
    pub created_ts: i64,
    pub bump: u8,
}

impl IdentifierCommitment {
    pub const SPACE: usize = 8 + 32 + 8 + 32 + 8 + 1;
}

#[account]
pub struct DiscoveryRequest {
    pub requester: Pubkey,
    pub request_id: u64,
    pub encrypted_set_hash: [u8; 32],
    pub max_contacts: u16,
    pub status: u8,
    pub bump: u8,
}

impl DiscoveryRequest {
    pub const SPACE: usize = 8 + 32 + 8 + 32 + 2 + 1 + 1;
}

#[account]
pub struct ActionReceipt {
    pub actor: Pubkey,
    pub action_id: u64,
    pub action_type: u8,
    pub payload_hash: [u8; 32],
    pub created_ts: i64,
    pub bump: u8,
}

impl ActionReceipt {
    pub const SPACE: usize = 8 + 32 + 8 + 1 + 32 + 8 + 1;
}
