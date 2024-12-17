use std::rc::Rc;

use anchor_client::{solana_sdk::signature::Keypair, Client, Cluster};

////////////////////////////////////////////////////////////////////////////////

// https://stackoverflow.com/questions/25413201/how-do-i-implement-a-trait-i-dont-own-for-a-type-i-dont-own
pub struct WrappedKeypair(pub Keypair);

impl WrappedKeypair {
    pub fn new(keypair: Keypair) -> Self {
        WrappedKeypair(keypair)
    }
}

impl Clone for WrappedKeypair {
    fn clone(&self) -> Self {
        let keypair = Keypair::from_bytes(&self.0.to_bytes()).unwrap();
        WrappedKeypair(keypair)
    }
}

////////////////////////////////////////////////////////////////////////////////

pub fn get_solana_client(payer: WrappedKeypair) -> Client<Rc<Keypair>> {
    let cluster_opt = match std::env::var("CLUSTER_OPT") {
        Ok(val) => match val.as_str() {
            "devnet" => Cluster::Devnet,
            "testnet" => Cluster::Testnet,
            "mainnet" => Cluster::Mainnet,
            _ => Cluster::Localnet,
        },
        Err(_) => Cluster::Localnet,
    };

    Client::new(cluster_opt, Rc::new(payer.0))
}
