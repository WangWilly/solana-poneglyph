use serde::{Serialize, Deserialize};

////////////////////////////////////////////////////////////////////////////////

#[derive(Deserialize)]
pub struct GetTicketV1Query {
    pub aes_gcm_tag: String,
}

#[derive(Serialize)]
pub struct GetTicketV1Resp {
    pub name: String,
    pub owner: String,
    pub uri: String,
}
