use axum::{extract::State, Json};

use crate::pkgs::body_parsers::jpeg::Jpeg;

use super::state::CtrlState;
use crate::pkgs::common::ApiResult;
use crate::pkgs::ctx::Ctx;

use crate::info;

use super::dtos::create_v1::CreateAssetV1Resp;

////////////////////////////////////////////////////////////////////////////////
// TODO: https://stackoverflow.com/questions/477816/which-json-content-type-do-i-use

#[axum::debug_handler]
pub async fn create_asset_v1(
    ctx: Ctx,
    State(state): State<CtrlState>,
    jpeg: Jpeg,
) -> ApiResult<Json<CreateAssetV1Resp>> {
    info!("create_asset_v1 - {:?}", ctx);

    // https://stackoverflow.com/questions/30154541/how-do-i-concatenate-strings
    tokio::fs::write(state.default_dest + "/" + &jpeg.name, jpeg.data)
        .await
        .unwrap();

    Ok(Json(CreateAssetV1Resp {}))
}
