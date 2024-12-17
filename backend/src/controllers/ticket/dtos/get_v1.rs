use serde::Serialize;

////////////////////////////////////////////////////////////////////////////////

#[derive(Serialize)]
pub struct GetTicketV1Resp {
    pub name: String,
    pub owner: String,
    pub uri: String,
}
