use ring::aead::NonceSequence;
use ring::aead::NONCE_LEN;
use ring::aead::Nonce;
use ring::error::Unspecified;

use crate::info;

////////////////////////////////////////////////////////////////////////////////

pub struct CounterNonceSequence(pub u32);

impl NonceSequence for CounterNonceSequence {
    // called once for each seal operation
    fn advance(&mut self) -> Result<Nonce, Unspecified> {
        let mut nonce_bytes = vec![0; NONCE_LEN];

        let bytes = self.0.to_be_bytes();
        nonce_bytes[8..].copy_from_slice(&bytes);
        info!("nonce_bytes = {}", hex::encode(&nonce_bytes));

        self.0 += 1; // advance the counter
        Nonce::try_assume_unique_for_key(&nonce_bytes)
    }
}
