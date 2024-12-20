use axum::{extract::State, Json};

use super::dtos::create_v1::{CreateTicketV1Req, CreateTicketV1Resp};
use super::state::CtrlState;
use crate::pkgs::common::ApiResult;
use crate::pkgs::ctx::Ctx;

use crate::info;

// https://solana.stackexchange.com/questions/14274/how-can-i-use-declare-program-for-client-side-rust
// https://github.com/coral-xyz/anchor/tree/master/client
// https://docs.rs/anchor-client/latest/anchor_client/
use anchor_client::solana_sdk::signer::keypair::Keypair;
use anchor_client::solana_sdk::{pubkey::Pubkey, signer::Signer, system_program};

use super::pkgs::anchor_utils::get_solana_client;

use contract::ticket::create_v1::Args4CreateTicketV1;
use contract::{accounts, instruction};

use super::pkgs::solana_program_public_key::{
    get_life_helper_id, get_mpl_core_id, get_ticket_contract_id,
};

////////////////////////////////////////////////////////////////////////////////
// TODO: https://solana.stackexchange.com/questions/5275/error-message-a-seeds-constraint-was-violated

#[axum::debug_handler]
pub async fn create_ticket_v1(
    ctx: Ctx,
    State(state): State<CtrlState>,
    Json(req): Json<CreateTicketV1Req>,
) -> ApiResult<Json<CreateTicketV1Resp>> {
    info!("create_ticket_v1 - {:?}", ctx);

    ////////////////////////////////////////////////////////////////////////////
    // Arrange
    let asset = Keypair::new();
    let life_helper = get_life_helper_id();
    let (pda_address, _bump) =
        Pubkey::find_program_address(&[b"mpl-core", &asset.pubkey().to_bytes()], &life_helper);
    info!("asset: {:?}", asset.pubkey());
    info!("pda_address: {:?}", pda_address);
    let ticket_contract = get_ticket_contract_id();
    let mpl_core = get_mpl_core_id();

    ////////////////////////////////////////////////////////////////////////////
    // Resolve
    // https://docs.rs/axum/latest/axum/attr.debug_handler.html
    // https://users.rust-lang.org/t/future-cannot-be-sent-between-threads-safely-axum-scraper/92525
    tokio::task::spawn_blocking(move || {
        let client = get_solana_client(state.system_payer.clone());
        let program = client.program(ticket_contract).unwrap();
        let tx = program
            .request()
            .accounts(accounts::Accounts4CreateTicketV1 {
                asset: asset.pubkey(),
                collection: None,
                authority: None,
                payer: state.system_payer.0.pubkey(),
                owner: None,
                update_authority: None,
                life_helper_pda: pda_address,
                life_helper_program: life_helper,
                system_program: system_program::ID,
                mpl_core_program: mpl_core,
            })
            .args(instruction::CreateTicketV1 {
                args: Args4CreateTicketV1 {
                    name: req.name,
                    uri: req.uri,
                    transfer_limit: req.transfer_limit,
                },
            })
            .signer(&asset)
            .signer(&state.system_payer.0)
            .send()
            .unwrap();
        info!("tx: {:?}", tx);
    })
    .await
    .unwrap();

    ////////////////////////////////////////////////////////////////////////////
    // Compose
    Ok(Json(CreateTicketV1Resp {}))
}
