use anchor_lang::prelude::*;

////////////////////////////////////////////////////////////////////////////////

#[error_code]
pub enum LifeError {
    #[msg("Transfer limit exceeded")]
    TransferLimitExceeded,
}
