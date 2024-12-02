use anchor_lang::prelude::*;

use mpl_core::{
    instructions::CreateCollectionV2CpiBuilder,
    ID as MPL_CORE_ID,
};

////////////////////////////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct CreateCollectionAccounts<'info> {
    #[account(mut)]
    pub collection: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub update_authority: Option<Signer<'info>>,
    pub system_program: Program<'info, System>,
    /// CHECK: this account is checked by the address constraint
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

////////////////////////////////////////////////////////////////////////////

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateCollectionArgs {
    name: String,
    uri: String,
}

////////////////////////////////////////////////////////////////////////////

pub fn create_collection_impl(
    ctx: Context<CreateCollectionAccounts>,
    args: CreateCollectionArgs,
) -> Result<()> {
    msg!("Creating a collection...");

    ////////////////////////////////////////////////////////////////////////

    let update_authority = match &ctx.accounts.update_authority {
        Some(update_authority) => Some(update_authority.to_account_info()),
        None => None,
    };

    ////////////////////////////////////////////////////////////////////////

    CreateCollectionV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .collection(&ctx.accounts.collection.to_account_info())
        .payer(&ctx.accounts.payer.to_account_info())
        .update_authority(update_authority.as_ref())
        .name(args.name)
        .uri(args.uri)
        .system_program(&ctx.accounts.system_program.to_account_info())
        .invoke()?;

    ////////////////////////////////////////////////////////////////////////

    Ok(())
}