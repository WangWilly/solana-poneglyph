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

    /// CHECK: this account will be checked by the mpl_core program
    #[account(mut)]
    pub new_owner: UncheckedAccount<'info>,

    /// CHECK: this account will not be checked
    pub asset: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"mpl-core", asset.key().as_ref()], bump = oracle_account.bump)]
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
        msg!("Unlimited transfers allowed");
        pass_transfer(&mut ctx.accounts.oracle_account);
        return Ok(());
    }

    if ctx.accounts.oracle_account.curr_transfer + 1 > ctx.accounts.oracle_account.transfer_limit {
        msg!("Transfer limit exceeded");
        reject_transfer(&mut ctx.accounts.oracle_account);
        // return Err(LifeError::TransferLimitExceeded.into());
        return Ok(());
    }

    if ctx.accounts.oracle_account.from != *ctx.accounts.signer.key {
        msg!("Transfer from unauthorized account");
        reject_transfer(&mut ctx.accounts.oracle_account);
        return Ok(());
    }

    msg!("Transferring ownership...");
    ctx.accounts.oracle_account.from = ctx.accounts.oracle_account.current;
    ctx.accounts.oracle_account.current = *ctx.accounts.new_owner.key;
    ctx.accounts.oracle_account.curr_transfer += 1;
    pass_transfer(&mut ctx.accounts.oracle_account);

    Ok(())
}
