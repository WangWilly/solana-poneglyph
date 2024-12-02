use anchor_lang::prelude::*;

use mpl_core::{
    accounts::BaseCollectionV1,
    instructions::CreateV2CpiBuilder,
    ID as MPL_CORE_ID,
};

////////////////////////////////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct BatchCreateTicketAccounts<'info> {
    #[account(mut)]
    pub asset: Signer<'info>,
    #[account(mut)]
    pub collection: Option<Account<'info, BaseCollectionV1>>,
    pub authority: Option<Signer<'info>>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: this account will be checked by the mpl_core program
    pub owner: Option<UncheckedAccount<'info>>,
    /// CHECK: this account will be checked by the mpl_core program
    pub update_authority: Option<UncheckedAccount<'info>>,
    pub system_program: Program<'info, System>,
    /// CHECK: this account is checked by the address constraint
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

////////////////////////////////////////////////////////////////////////////////

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct SingleTicket {
    name: String,
    uri: String,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone)]
pub struct BatchCreateTicketArgs {
    items: Vec<SingleTicket>,
}

////////////////////////////////////////////////////////////////////////////////
/// TODO: (unimplemented) Add a batch_create_ticket instruction that creates multiple tickets at once.

pub fn batch_create_ticket_impl(
    ctx: Context<BatchCreateTicketAccounts>,
    args: BatchCreateTicketArgs,
) -> Result<()> {
    msg!("Creating a ticket...");

    ////////////////////////////////////////////////////////////////////////

    let collection = match &ctx.accounts.collection {
        Some(collection) => Some(collection.to_account_info()),
        None => None,
    };

    let authority = match &ctx.accounts.authority {
        Some(authority) => Some(authority.to_account_info()),
        None => None,
    };

    let owner = match &ctx.accounts.owner {
        Some(owner) => Some(owner.to_account_info()),
        None => None,
    };

    let update_authority = match &ctx.accounts.update_authority {
        Some(update_authority) => Some(update_authority.to_account_info()),
        None => None,
    };

    ////////////////////////////////////////////////////////////////////////
    
    for item in args.items.iter() {
        

        CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info()) // It uses the builder pattern to construct the CPI, allowing for a clear and flexible way to set up the instruction parameters.
            .asset(&ctx.accounts.asset.to_account_info())
            .collection(collection.as_ref())
            .authority(authority.as_ref())
            .payer(&ctx.accounts.payer.to_account_info())
            .owner(owner.as_ref())
            .update_authority(update_authority.as_ref())
            .system_program(&ctx.accounts.system_program.to_account_info())
            .name(item.name.clone())
            .uri(item.uri.clone())
            .invoke()?;
    }

    Ok(())
}


