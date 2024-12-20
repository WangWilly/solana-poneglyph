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
    // https://www.reddit.com/r/rust/comments/r8c65v/crate_for_aes256_which_one_to_choose_questions/
    // https://www.reddit.com/r/rust/comments/e0frpx/how_do_i_use_aes_in_the_ring_api/
    // https://web3developer.io/authenticated-encryption-in-rust-using-ring/
    // https://www.perplexity.ai/search/what-is-the-difference-between-oMHe2yr0SL.UocD8S9o9Mw
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
        std::env::var("DELEGATE_SECRET").unwrap_or("e15eedf155f13491fb5d77121006d5d980f6c05abb03ca89c684d70f915bac11".to_string());

    delegate_secret
}
