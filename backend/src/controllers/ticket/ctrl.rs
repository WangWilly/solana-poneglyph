use axum::{routing::{get, post}, Router};

use super::create_v1::create_ticket_v1;
use super::get_v1::get_ticket_v1;
use super::state::CtrlState;

use crate::pkgs::errors::add_timeout_layer;

////////////////////////////////////////////////////////////////////////////////

pub fn new(state: CtrlState) -> Router {
    let router = Router::new()
        .route("/api/ticket/v1", post(create_ticket_v1))
        .route("/api/ticket/v1/:tid", get(get_ticket_v1))
        .with_state(state);

    // TODO: configure timeout
    add_timeout_layer(router, 120)
}
