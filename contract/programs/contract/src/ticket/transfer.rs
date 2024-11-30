use anchor_lang::prelude::*;

use mpl_core::{instructions::TransferV1CpiBuilder, ID as MPL_CORE_ID};

////////////////////////////////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct TransferTicketAccounts<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: this account will be checked by the mpl_core program
    #[account(mut)]
    pub ticket_asset: UncheckedAccount<'info>,
    /// CHECK: this account will be checked by the mpl_core program
    #[account(mut)]
    pub new_owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: this account will be checked by the mpl_core program
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

////////////////////////////////////////////////////////////////////////////////

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct TransferTicketArgs {}

////////////////////////////////////////////////////////////////////////////////

pub fn transfer_ticket_impl(
    ctx: Context<TransferTicketAccounts>,
    _: TransferTicketArgs,
) -> Result<()> {
    msg!("Transferring a ticket...");

    ////////////////////////////////////////////////////////////////////////

    TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .asset(&ctx.accounts.ticket_asset)
        .payer(&ctx.accounts.payer.to_account_info())
        .new_owner(&ctx.accounts.new_owner)
        .system_program(Some(&ctx.accounts.system_program.to_account_info()))
        .invoke()?;

    ////////////////////////////////////////////////////////////////////////

    Ok(())
}
