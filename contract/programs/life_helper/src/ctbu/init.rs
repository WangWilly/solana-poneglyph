use anchor_lang::prelude::*;

use mpl_core::types::{OracleValidation, ExternalValidationResult};

////////////////////////////////////////////////////////////////////////////////

#[account]
pub struct Validation {
    pub validation: OracleValidation,
    pub transfer_limit: u16,
    pub curr_transfer: u16,
}

impl Validation {
    pub fn size() -> usize {
        8 // anchor discriminator
        + 5 // validation
        + 2 // transfer_limit
        + 2 // curr_transfer
    }
}

////////////////////////////////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct Accounts4Init<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(init, payer = payer, space = Validation::size())]
    pub oracle_account: Account<'info, Validation>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct Args4Init {
    pub transfer_limit: u16,
}

////////////////////////////////////////////////////////////////////////////////

pub fn initialize_impl(ctx: Context<Accounts4Init>, args: Args4Init) -> Result<()> {
    ctx.accounts.oracle_account.transfer_limit = args.transfer_limit;
    ctx.accounts.oracle_account.curr_transfer = 0;

    ctx.accounts.oracle_account.validation = OracleValidation::V1 { 
        create: ExternalValidationResult::Pass,
        transfer: ExternalValidationResult::Pass,
        burn: ExternalValidationResult::Rejected,
        update: ExternalValidationResult::Rejected,
    };

    Ok(())
}