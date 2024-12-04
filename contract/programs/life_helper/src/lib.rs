use anchor_lang::prelude::*;

mod ctbu;
use ctbu::{init::*, transfer::*};

////////////////////////////////////////////////////////////////////////////////

declare_id!("6qjMzebX6DBJMbrNPk2UejZSkF7i8H5Nc5gbQAgKw7ay");

////////////////////////////////////////////////////////////////////////////////

#[program]
pub mod life_helper {
    use super::*;

    pub fn initialize(ctx: Context<Accounts4Init>) -> Result<()> {
        msg!("Initializing Oracle for controling lifecycle of MPL Core");

        let args = Args4Init { transfer_limit: 1 };
        initialize_impl(ctx, args)
    }

    pub fn transfer(ctx: Context<Accounts4Transfer>) -> Result<()> {
        msg!("Transfering ownership of MPL Core");

        transfer_impl(ctx)
    }
}
