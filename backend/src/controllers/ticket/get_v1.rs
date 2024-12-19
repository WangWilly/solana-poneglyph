use std::str::FromStr;

use axum::extract::{Json, Path, State};

use super::dtos::get_v1::GetTicketV1Resp;
use super::state::CtrlState;
use crate::pkgs::common::ApiResult;
use crate::pkgs::ctx::Ctx;

use crate::info;

use crate::controllers::ticket::pkgs::solana_program_public_key::get_life_helper_id;
use anchor_client::solana_sdk::pubkey::Pubkey;

use mpl_core::Asset;
// use life_helper::ctbu::init::Validation;

////////////////////////////////////////////////////////////////////////////////

#[axum::debug_handler]
pub async fn get_ticket_v1(
    ctx: Ctx,
    State(state): State<CtrlState>,
    Path(tid): Path<String>,
) -> ApiResult<Json<GetTicketV1Resp>> {
    info!("get_ticket_v1 - {:?}", ctx);

    ////////////////////////////////////////////////////////////////////////////
    // Arrange
    let ticket_id = Pubkey::from_str(&tid).unwrap();
    let (_pda_address, _bump) =
        Pubkey::find_program_address(&[b"mpl-core", &ticket_id.to_bytes()], &get_life_helper_id());

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

    ////////////////////////////////////////////////////////////////////////////
    // Compose
    Ok(Json(GetTicketV1Resp {
        name: ticket.base.name,
        owner: ticket.base.owner.to_string(),
        uri: ticket.base.uri,
    }))
}
