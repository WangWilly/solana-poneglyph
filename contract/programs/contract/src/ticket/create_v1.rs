use std::str::FromStr;

use anchor_lang::prelude::*;

use mpl_core::{
    accounts::BaseCollectionV1, instructions::CreateV2CpiBuilder, types::{
        ExternalCheckResult, ExternalPluginAdapterInitInfo, ExtraAccount, HookableLifecycleEvent,
        OracleInitInfo, ValidationResultsOffset,
    }, ID as MPL_CORE_ID
};

use life_helper::cpi::accounts::Accounts4Init as LifeHelperAccounts4Init;
use life_helper::ctbu::init::Args4Init as LifeHelperArgs4Init;
use life_helper::program::LifeHelper;

///////////////////////////////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct Accounts4CreateTicketV1<'info> {
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

    // https://solana.stackexchange.com/questions/2636/how-to-convert-pubkey-to-accountinfo
    /// CHECK: this account will be checked by the life_helper program
    #[account(mut)]
    pub life_helper_pda: UncheckedAccount<'info>,
    pub life_helper_program: Program<'info, LifeHelper>,

    /// Must match the System Program's ID.
    pub system_program: Program<'info, System>,
    /// CHECK: this account is checked by the address constraint
    #[account(address = MPL_CORE_ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

///////////////////////////////////////////////////////////////////////////////

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct Args4CreateTicketV1 {
    name: String,
    uri: String,
    transfer_limit: u16,
}

///////////////////////////////////////////////////////////////////////////////

pub fn create_ticket_v1_impl(
    ctx: Context<Accounts4CreateTicketV1>,
    args: Args4CreateTicketV1,
) -> Result<()> {
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

    let mut external_plugin_adapters: Vec<ExternalPluginAdapterInitInfo> = vec![];

    ////////////////////////////////////////////////////////////////////////

    // https://github.com/metaplex-foundation/mpl-core/blob/7d82981e9be90592579055cfc8f4006aeeff28c3/programs/mpl-core/src/plugins/external/oracle.rs#L76
    // https://github.com/metaplex-foundation/mpl-core/blob/7d82981e9be90592579055cfc8f4006aeeff28c3/programs/mpl-core/src/plugins/external_plugin_adapters.rs#L467
    // https://github.com/metaplex-foundation/mpl-core/blob/7d82981e9be90592579055cfc8f4006aeeff28c3/programs/mpl-core/src/plugins/lifecycle.rs#L812

    let life_helper_program = ctx.accounts.life_helper_program.to_account_info();
    let life_helper_cpi_accounts = LifeHelperAccounts4Init {
        signer: ctx.accounts.payer.to_account_info(),
        payer: ctx.accounts.payer.to_account_info(),
        asset: ctx.accounts.asset.to_account_info(),
        oracle_account: ctx.accounts.life_helper_pda.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };
    // https://stackoverflow.com/questions/70675404/cross-program-invocation-with-unauthorized-signer-or-writable-account
    // https://solana.com/developers/guides/getstarted/how-to-cpi-with-signer
    let payer_seed = ctx.accounts.payer.to_account_info().key();
    let asset_seed = ctx.accounts.asset.to_account_info().key();
    let bump_seed = ctx.accounts.life_helper_pda.to_account_info().key();
    let signer_seeds: &[&[&[u8]]] = &[&[payer_seed.as_ref(), asset_seed.as_ref(), b"mpl-core", bump_seed.as_ref()]];
    let life_helper_ctx =
        CpiContext::new(life_helper_program, life_helper_cpi_accounts).with_signer(signer_seeds);
    life_helper::cpi::initialize(
        life_helper_ctx,
        LifeHelperArgs4Init {
            transfer_limit: args.transfer_limit,
        },
    )?;

    // https://solana.com/docs/core/pda
    // https://github.com/metaplex-foundation/mpl-core/blob/main/clients/js/src/plugins/lifecycleChecks.ts#L42
    let oracle_plugin = Pubkey::from_str("6qjMzebX6DBJMbrNPk2UejZSkF7i8H5Nc5gbQAgKw7ay").unwrap();
    external_plugin_adapters.push(ExternalPluginAdapterInitInfo::Oracle(OracleInitInfo {
        base_address: oracle_plugin,
        init_plugin_authority: None,
        lifecycle_checks: vec![(
            HookableLifecycleEvent::Transfer,
            ExternalCheckResult { flags: 4 }, // CAN_REJECT
        )],
        base_address_config: Some(ExtraAccount::PreconfiguredAsset {
            // TODO: unused parameters?
            is_signer: false,
            is_writable: false,
        }),
        results_offset: Some(ValidationResultsOffset::Anchor),
    }));

    ////////////////////////////////////////////////////////////////////////

    CreateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
        .asset(&ctx.accounts.asset.to_account_info())
        .collection(collection.as_ref())
        .authority(authority.as_ref())
        .payer(&ctx.accounts.payer.to_account_info())
        .owner(owner.as_ref())
        .update_authority(update_authority.as_ref())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .name(args.name)
        .uri(args.uri)
        .external_plugin_adapters(external_plugin_adapters)
        .invoke()?;

    Ok(())
}
