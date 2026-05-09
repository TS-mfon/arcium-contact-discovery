pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
pub use constants::*;
pub use instructions::*;
#[allow(unused_imports)]
pub use state::*;

declare_id!("2cWbFVSzasSV2JgBmZNdK7NK3Le9WwNGQerMgbz5eHfq");

#[arcium_program]
pub mod arcium_contact_discovery {
    use super::*;

    pub fn register_identifier(
        ctx: Context<RegisterIdentifier>,
        commitment_id: u64,
        commitment_hash: [u8; 32],
    ) -> Result<()> {
        let commitment = &mut ctx.accounts.commitment;
        commitment.owner = ctx.accounts.owner.key();
        commitment.commitment_id = commitment_id;
        commitment.commitment_hash = commitment_hash;
        commitment.created_ts = Clock::get()?.unix_timestamp;
        commitment.bump = ctx.bumps.commitment;
        Ok(())
    }

    pub fn submit_discovery_request(
        ctx: Context<SubmitDiscoveryRequest>,
        request_id: u64,
        encrypted_set_hash: [u8; 32],
        max_contacts: u16,
    ) -> Result<()> {
        require!(max_contacts > 0, error::ErrorCode::CustomError);

        let request = &mut ctx.accounts.request;
        request.requester = ctx.accounts.requester.key();
        request.request_id = request_id;
        request.encrypted_set_hash = encrypted_set_hash;
        request.max_contacts = max_contacts;
        request.status = 1;
        request.bump = ctx.bumps.request;
        Ok(())
    }

    pub fn record_action(
        ctx: Context<RecordAction>,
        action_id: u64,
        action_type: u8,
        payload_hash: [u8; 32],
    ) -> Result<()> {
        let receipt = &mut ctx.accounts.action_receipt;
        receipt.actor = ctx.accounts.actor.key();
        receipt.action_id = action_id;
        receipt.action_type = action_type;
        receipt.payload_hash = payload_hash;
        receipt.created_ts = Clock::get()?.unix_timestamp;
        receipt.bump = ctx.bumps.action_receipt;
        Ok(())
    }

    pub fn init_add_together_comp_def(ctx: Context<InitAddTogetherCompDef>) -> Result<()> {
        add_together::init_add_together_comp_def_handler(ctx)
    }

    pub fn add_together(
        ctx: Context<AddTogether>,
        computation_offset: u64,
        ciphertext_0: [u8; 32],
        ciphertext_1: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        add_together::add_together_handler(ctx, computation_offset, ciphertext_0, ciphertext_1, pub_key, nonce)
    }

    #[arcium_callback(encrypted_ix = "add_together")]
    pub fn add_together_callback(
        ctx: Context<AddTogetherCallback>,
        output: SignedComputationOutputs<AddTogetherOutput>,
    ) -> Result<()> {
        add_together::add_together_callback_handler(ctx, output)
    }
}

#[derive(Accounts)]
#[instruction(commitment_id: u64)]
pub struct RegisterIdentifier<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = IdentifierCommitment::SPACE,
        seeds = [b"identifier", owner.key().as_ref(), &commitment_id.to_le_bytes()],
        bump
    )]
    pub commitment: Account<'info, IdentifierCommitment>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(request_id: u64)]
pub struct SubmitDiscoveryRequest<'info> {
    #[account(mut)]
    pub requester: Signer<'info>,
    #[account(
        init,
        payer = requester,
        space = DiscoveryRequest::SPACE,
        seeds = [b"request", requester.key().as_ref(), &request_id.to_le_bytes()],
        bump
    )]
    pub request: Account<'info, DiscoveryRequest>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(action_id: u64)]
pub struct RecordAction<'info> {
    #[account(mut)]
    pub actor: Signer<'info>,
    #[account(
        init,
        payer = actor,
        space = ActionReceipt::SPACE,
        seeds = [b"action", actor.key().as_ref(), &action_id.to_le_bytes()],
        bump
    )]
    pub action_receipt: Account<'info, ActionReceipt>,
    pub system_program: Program<'info, System>,
}
