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
    // delegate_secret: String,
}

////////////////////////////////////////////////////////////////////////////////

pub fn get_system_payer() -> WrappedKeypair {
    let keypair_file = std::env::var("SYSTEM_PAYER").expect("SYSTEM_PAYER is not set");

    let keypair = read_keypair_file(&keypair_file).unwrap();
    WrappedKeypair::new(keypair)
}
