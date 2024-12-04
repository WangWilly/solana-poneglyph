use anchor_lang::prelude::*;

use super::init::Validation;
// use super::errors::LifeError;
use mpl_core::types::{ExternalValidationResult, OracleValidation};

////////////////////////////////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct Accounts4Transfer<'info> {
    pub signer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, seeds = [b"mpl-core"], bump = oracle_account.bump)]
    pub oracle_account: Account<'info, Validation>,
    pub system_program: Program<'info, System>,
}

////////////////////////////////////////////////////////////////////////////////

fn reject_transfer(acc: &mut Validation) {
    acc.validation = OracleValidation::V1 {
        create: ExternalValidationResult::Pass,
        transfer: ExternalValidationResult::Rejected,
        burn: ExternalValidationResult::Rejected,
        update: ExternalValidationResult::Rejected,
    };
}

fn pass_transfer(acc: &mut Validation) {
    acc.validation = OracleValidation::V1 {
        create: ExternalValidationResult::Pass,
        transfer: ExternalValidationResult::Pass,
        burn: ExternalValidationResult::Rejected,
        update: ExternalValidationResult::Rejected,
    };
}

////////////////////////////////////////////////////////////////////////////////

pub fn transfer_impl(ctx: Context<Accounts4Transfer>) -> Result<()> {
    if ctx.accounts.oracle_account.transfer_limit == 0 {
        pass_transfer(&mut ctx.accounts.oracle_account);
        return Ok(());
    }

    if ctx.accounts.oracle_account.curr_transfer + 1 > ctx.accounts.oracle_account.transfer_limit {
        reject_transfer(&mut ctx.accounts.oracle_account);
        // return Err(LifeError::TransferLimitExceeded.into());
        return Ok(());
    }

    ctx.accounts.oracle_account.curr_transfer += 1;
    pass_transfer(&mut ctx.accounts.oracle_account);

    Ok(())
}
