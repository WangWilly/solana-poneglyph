use serde::{Deserialize, Serialize};

////////////////////////////////////////////////////////////////////////////////

#[derive(Deserialize)]
pub struct CreateTicketV1Req {
    pub name: String,
    pub uri: String,
    pub transfer_limit: u16,
}

#[derive(Serialize)]
pub struct CreateTicketV1Resp {}
