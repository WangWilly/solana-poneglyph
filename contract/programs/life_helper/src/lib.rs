use anchor_lang::prelude::*;

mod ctbu;
use ctbu::{init::*, transfer::*};

////////////////////////////////////////////////////////////////////////////////

declare_id!("6qjMzebX6DBJMbrNPk2UejZSkF7i8H5Nc5gbQAgKw7ay");

////////////////////////////////////////////////////////////////////////////////

#[program]
pub mod life_helper {
    use super::*;

    pub fn initialize(ctx: Context<Accounts4Init>, args: Args4Init) -> Result<()> {
        initialize_impl(ctx, args)
    }

    pub fn transfer(ctx: Context<Accounts4Transfer>) -> Result<()> {
        transfer_impl(ctx)
    }
}

