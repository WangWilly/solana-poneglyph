use std::sync::Arc;

// use crate::pkgs::db_helper::DbPool;

use super::pkgs::anchor_utils::WrappedKeypair;
use super::pkgs::solana_client::SolanaClient;

use anchor_client::solana_sdk::signature::read_keypair_file;

////////////////////////////////////////////////////////////////////////////////

#[derive(Clone)]
pub struct CtrlState {
    // db: DbPool,
    pub solana_client: Arc<SolanaClient>,
    pub system_payer: WrappedKeypair,
    // https://medium.com/coderhack-com/coderhack-cryptography-libraries-and-uses-in-rust-31957242299f
    // https://zsiciarz.github.io/24daysofrust/book/vol1/day21.html
    // https://crypto.stackexchange.com/questions/3965/what-is-the-main-difference-between-a-key-an-iv-and-a-nonce
    pub delegate_secret: String,
}

////////////////////////////////////////////////////////////////////////////////

pub fn get_system_payer() -> WrappedKeypair {
    let keypair_file = std::env::var("SYSTEM_PAYER").expect("SYSTEM_PAYER is not set");

    let keypair = read_keypair_file(&keypair_file).unwrap();
    WrappedKeypair::new(keypair)
}

pub fn get_delegate_secret() -> String {
    let delegate_secret =
        std::env::var("DELEGATE_SECRET").unwrap_or("NvDy+u51EfMC+amJzoJO+w==".to_string());

    delegate_secret
}
