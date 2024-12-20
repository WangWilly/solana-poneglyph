use std::str::FromStr;

use axum::extract::{Json, Path, State, Query};

use super::dtos::get_v1::{GetTicketV1Resp, GetTicketV1Query};
use super::state::CtrlState;
use crate::pkgs::common::ApiResult;
use crate::pkgs::ctx::Ctx;

use crate::info;

use crate::controllers::ticket::pkgs::solana_program_public_key::get_life_helper_id;
use anchor_client::solana_sdk::pubkey::Pubkey;

use mpl_core::Asset;
// use life_helper::ctbu::init::Validation;

use crate::pkgs::encrypt_utils::CounterNonceSequence;
use ring::aead::Aad;
use ring::aead::AES_256_GCM;
use ring::aead::UnboundKey;
use ring::aead::BoundKey;
use ring::aead::OpeningKey;

////////////////////////////////////////////////////////////////////////////////

#[axum::debug_handler]
pub async fn get_ticket_v1(
    ctx: Ctx,
    State(state): State<CtrlState>,
    Path(tid): Path<String>,
    Query(query): Query<GetTicketV1Query>,
) -> ApiResult<Json<GetTicketV1Resp>> {
    info!("get_ticket_v1 - {:?}", ctx);

    ////////////////////////////////////////////////////////////////////////////
    // Arrange
    let ticket_id = Pubkey::from_str(&tid).unwrap();
    let (_pda_address, _bump) =
        Pubkey::find_program_address(&[b"mpl-core", &ticket_id.to_bytes()], &get_life_helper_id());

    let key_bytes = hex::decode(state.delegate_secret).unwrap();
    let unbound_key = UnboundKey::new(&AES_256_GCM, &key_bytes).unwrap();
    let nonce_sequence = CounterNonceSequence(1);
    let mut opening_key = OpeningKey::new(unbound_key, nonce_sequence);
    let associated_data = Aad::empty();
    
    ////////////////////////////////////////////////////////////////////////////
    // Resolve
    // https://developers.metaplex.com/core/fetch
    let ticket_data = state.solana_client.get_account_data(&ticket_id).unwrap();
    let ticket = Asset::from_bytes(&ticket_data).unwrap();
    // info!("{:?}", ticket);

    // https://solana.stackexchange.com/questions/3902/whats-the-best-way-to-deserialize-anchor-account-data-from-accountinfo
    // TODO: https://www.quicknode.com/guides/solana-development/accounts-and-data/how-to-deserialize-account-data-on-solana
    // TODO: consider using JS to deserialize the data
    // let _life_helper_oracle_data  = state.solana_client.get_account_data(&pda_address).unwrap();
    // let _life_helper_oracle = Validation::try_deserialize(_life_helper_oracle_data);

    let encrypted_uri_data = hex::decode(ticket.base.uri).unwrap();
    let aes_gcm_tag = hex::decode(query.aes_gcm_tag).unwrap();
    let mut encrypted_uri_data_with_tag = [encrypted_uri_data, aes_gcm_tag].concat();
    let decrypted_data = opening_key.open_in_place(associated_data, &mut encrypted_uri_data_with_tag).unwrap();

    ////////////////////////////////////////////////////////////////////////////
    // Compose
    Ok(Json(GetTicketV1Resp {
        name: ticket.base.name,
        owner: ticket.base.owner.to_string(),
        uri: String::from_utf8(decrypted_data.to_vec()).unwrap(),
    }))
}
