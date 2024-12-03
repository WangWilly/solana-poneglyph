use anchor_lang::prelude::*;

use super::init::Validation;
// use super::errors::LifeError;
use mpl_core::types::{OracleValidation, ExternalValidationResult};

////////////////////////////////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct Accounts4Transfer<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub oracle_account: Account<'info, Validation>,
}

////////////////////////////////////////////////////////////////////////////////

pub fn transfer_impl(ctx: Context<Accounts4Transfer>) -> Result<()> {
    if ctx.accounts.oracle_account.curr_transfer + 1 > ctx.accounts.oracle_account.transfer_limit {
        ctx.accounts.oracle_account.validation = OracleValidation::V1 { 
            create: ExternalValidationResult::Pass,
            transfer: ExternalValidationResult::Rejected,
            burn: ExternalValidationResult::Rejected,
            update: ExternalValidationResult::Rejected,
        };

        // return Err(LifeError::TransferLimitExceeded.into());
        return Ok(());
    }

    ctx.accounts.oracle_account.curr_transfer += 1;
    ctx.accounts.oracle_account.validation = OracleValidation::V1 { 
        create: ExternalValidationResult::Pass,
        transfer: ExternalValidationResult::Pass,
        burn: ExternalValidationResult::Rejected,
        update: ExternalValidationResult::Rejected,
    };

    Ok(())
}
