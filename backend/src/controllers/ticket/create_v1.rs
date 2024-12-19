use std::sync::{Arc, Mutex};
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

use rand::RngCore;
use rand::rngs::OsRng;
use rustc_serialize::base64::{STANDARD, ToBase64, FromBase64};
use crypto::aes::{self, KeySize};

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

    let mut gen = OsRng::default();
    let mut nonce: Vec<u8> = vec![0; 16];
    gen.fill_bytes(&mut nonce[..]);
    let nonce_arc = Arc::new(Mutex::new(nonce));
    let nonce_clone1 = Arc::clone(&nonce_arc);

    let key = state.delegate_secret.from_base64().unwrap();
    let encrypted_uri: Arc<Mutex<Vec<u8>>> = Arc::new(Mutex::new(vec![0; req.uri.len()]));
    let encrypted_uri_clone1 = Arc::clone(&encrypted_uri);
    tokio::task::spawn_blocking(move || {
        let nonce1 = nonce_clone1.lock().unwrap();
        let mut cipher = aes::ctr(KeySize::KeySize128, &key, &nonce1);
        let mut encrypted_uri_lock = encrypted_uri_clone1.lock().unwrap();
        cipher.process(req.uri.as_bytes(), &mut encrypted_uri_lock);
    });

    ////////////////////////////////////////////////////////////////////////////
    // Resolve
    // https://docs.rs/axum/latest/axum/attr.debug_handler.html
    // https://users.rust-lang.org/t/future-cannot-be-sent-between-threads-safely-axum-scraper/92525
    let encrypted_uri_clone2 = Arc::clone(&encrypted_uri);
    tokio::task::spawn_blocking(move || {
        let client = get_solana_client(state.system_payer.clone());
        let program = client.program(ticket_contract).unwrap();
        let encrypted_uri_lock = encrypted_uri_clone2.lock().unwrap();
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
                    uri: encrypted_uri_lock.to_base64(STANDARD),
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
    let nonce_clone2 = Arc::clone(&nonce_arc);
    let nonce_base64 = {
        nonce_clone2.lock().unwrap().to_base64(STANDARD)
    };
    Ok(Json(CreateTicketV1Resp {
        nonce: nonce_base64,
    }))
}
