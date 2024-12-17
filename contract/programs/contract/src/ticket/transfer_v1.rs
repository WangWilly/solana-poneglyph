use anchor_lang::prelude::*;

use mpl_core::{instructions::TransferV1CpiBuilder, ID as MPL_CORE_ID};

use life_helper::cpi::accounts::Accounts4Transfer as LifeHelperAccounts4Transfer;
use life_helper::program::LifeHelper;

////////////////////////////////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct Accounts4TransferTicketV1<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: this account will be checked by the mpl_core program
    #[account(mut)]
    pub ticket_asset: UncheckedAccount<'info>,
    /// CHECK: this account will be checked by the mpl_core program
    #[account(mut)]
    pub new_owner: UncheckedAccount<'info>,

    /// CHECK: this account will be checked by the life_helper program
    #[account(mut)]
    pub life_helper_pda: UncheckedAccount<'info>,
    pub life_helper_program: Program<'info, LifeHelper>,

    pub system_program: Program<'info, System>,
    /// CHECK: this account will be checked by the mpl_core program
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

////////////////////////////////////////////////////////////////////////////////

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct Args4TransferTicketV1 {}

////////////////////////////////////////////////////////////////////////////////

pub fn transfer_ticket_v1_impl(
    ctx: Context<Accounts4TransferTicketV1>,
    _: Args4TransferTicketV1,
) -> Result<()> {
    msg!("Transferring a ticket...");

    ////////////////////////////////////////////////////////////////////////

    let life_helper_program = ctx.accounts.life_helper_program.to_account_info();
    let life_helper_cpi_accounts = LifeHelperAccounts4Transfer {
        signer: ctx.accounts.payer.to_account_info(),
        payer: ctx.accounts.payer.to_account_info(),
        new_owner: ctx.accounts.new_owner.to_account_info(),
        asset: ctx.accounts.ticket_asset.to_account_info(),
        oracle_account: ctx.accounts.life_helper_pda.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };
    let payer_seed = ctx.accounts.payer.to_account_info().key();
    let asset_seed = ctx.accounts.ticket_asset.to_account_info().key();
    let bump_seed = ctx.accounts.life_helper_pda.to_account_info().key();
    let signer_seeds: &[&[&[u8]]] = &[&[
        payer_seed.as_ref(),
        payer_seed.as_ref(),
        asset_seed.as_ref(),
        b"mpl-core",
        bump_seed.as_ref(),
    ]];
    let life_helper_ctx =
        CpiContext::new(life_helper_program, life_helper_cpi_accounts).with_signer(signer_seeds);
    life_helper::cpi::transfer(life_helper_ctx)?;

    ////////////////////////////////////////////////////////////////////////

    TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .asset(&ctx.accounts.ticket_asset)
        .payer(&ctx.accounts.payer.to_account_info())
        .new_owner(&ctx.accounts.new_owner)
        .system_program(Some(&ctx.accounts.system_program.to_account_info()))
        .add_remaining_account(&ctx.accounts.life_helper_pda, false, false)
        .invoke()?;

    ////////////////////////////////////////////////////////////////////////

    Ok(())
}
