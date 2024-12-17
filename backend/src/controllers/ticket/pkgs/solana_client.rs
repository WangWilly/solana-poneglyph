use anchor_client::solana_client::rpc_client::RpcClient;
use std::sync::Arc;

////////////////////////////////////////////////////////////////////////////////

pub type SolanaClient = RpcClient;

////////////////////////////////////////////////////////////////////////////////

pub fn get_solana_client() -> Arc<SolanaClient> {
    let rpc_url = std::env::var("RPC_URL").unwrap_or("http://127.0.0.1:8899".to_string());

    Arc::new(RpcClient::new(rpc_url))
}
