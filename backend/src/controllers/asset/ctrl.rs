use axum::{routing::post, Router};

use super::state::CtrlState;

use super::create_v1::create_asset_v1;

////////////////////////////////////////////////////////////////////////////////

pub fn new(state: CtrlState) -> Router {
    let router = Router::new()
        .route("/api/asset/v1", post(create_asset_v1))
        .with_state(state);

    router
}
