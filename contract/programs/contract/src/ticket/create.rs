use anchor_lang::prelude::*;

use mpl_core::{
    accounts::BaseCollectionV1,
    instructions::CreateV2CpiBuilder,
    // types::{Plugin, FreezeDelegate, PluginAuthority,PluginAuthorityPair}
    ID as MPL_CORE_ID,
};

////////////////////////////////////////////////////////////////////////////////

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateTicketArgs {
    name: String,
    uri: String,
}

pub fn create_ticket_impl(
    ctx: Context<CreateTicketAccounts>,
    args: CreateTicketArgs,
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

    // let mut plugins: Vec<PluginAuthorityPair> = vec![];

    // plugins.push(
    //     PluginAuthorityPair {
    //         plugin: Plugin::FreezeDelegate(FreezeDelegate {frozen: true}),
    //         authority: Some(PluginAuthority::UpdateAuthority) // Freeze infintely
    //     }
    // );

    ////////////////////////////////////////////////////////////////////////

    // Before passing these accounts to the CreateV2CpiBuilder program instruction,
    // they need to be converted to their raw data form using the .to_account_info() method.

    // CreateV2CpiBuilder::new is used to construct a Cross-Program Invocation (CPI)
    // to the Metaplex Core program's CreateV2 instruction.
    CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info()) // It uses the builder pattern to construct the CPI, allowing for a clear and flexible way to set up the instruction parameters.
        // Account Setup: The builder methods (like .asset(), .collection(), etc.) are used to
        // specify which accounts should be passed to the Core program's instruction.
        .asset(&ctx.accounts.asset.to_account_info())
        .collection(collection.as_ref())
        .authority(authority.as_ref())
        .payer(&ctx.accounts.payer.to_account_info())
        .owner(owner.as_ref())
        .update_authority(update_authority.as_ref())
        .system_program(&ctx.accounts.system_program.to_account_info())
        // Parameter Setting: Methods like .name() and .uri() set the non-account parameters for the CreateV2 instruction.
        .name(args.name)
        .uri(args.uri)
        // Plugin Setup: The .plugins() method is used to specify the plugins that should be applied to the asset.
        // https://developers.metaplex.com/core/plugins
        // .plugins(plugins)
        // Execution: The .invoke() method at the end actually sends the constructed instruction to the Metaplex Core program for execution.
        .invoke()?;

    Ok(())
}

// It's a struct that defines the accounts required for the create_asset instruction in the Metaplex Core program.
#[derive(Accounts)] // The #[derive(Accounts)] macro allows Anchor to automatically generate code for account validation and deserialization.
pub struct CreateTicketAccounts<'info> {
    ////////////////////////////////////////////////////////////////////////////
    /// This is the account that will store the NFT's metadata.
    /// It must be mutable and a signer on the transaction.
    #[account(mut)]
    pub asset: Signer<'info>,
    ////////////////////////////////////////////////////////////////////////////
    /// An optional account representing the collection the asset belongs to.
    /// If provided, it must be a valid BaseCollectionV1 account.
    #[account(mut)]
    pub collection: Option<Account<'info, BaseCollectionV1>>,
    ////////////////////////////////////////////////////////////////////////////
    /// An optional signer account, likely for additional authorization.
    pub authority: Option<Signer<'info>>,
    ////////////////////////////////////////////////////////////////////////////
    /// The account paying for the transaction fees and rent.
    /// Must be mutable and a signer on the transaction.
    #[account(mut)]
    pub payer: Signer<'info>,
    ////////////////////////////////////////////////////////////////////////////
    /// An optional account representing the owner of the asset.
    /// Marked as UncheckedAccount, meaning Anchor won't perform additional checks.
    /// CHECK: this account will be checked by the mpl_core program
    pub owner: Option<UncheckedAccount<'info>>,
    ////////////////////////////////////////////////////////////////////////////
    /// An optional account with authority to update the asset.
    /// Also marked as UncheckedAccount.
    /// CHECK: this account will be checked by the mpl_core program
    pub update_authority: Option<UncheckedAccount<'info>>,
    ////////////////////////////////////////////////////////////////////////////
    /// A reference to the Solana System Program.
    /// Must match the System Program's ID.
    pub system_program: Program<'info, System>,
    ////////////////////////////////////////////////////////////////////////////
    /// A reference to the Metaplex Core Program.
    /// Constrained to match the MPL_CORE_ID address.
    /// CHECK: this account is checked by the address constraint
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}
