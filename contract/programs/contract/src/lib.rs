use anchor_lang::prelude::*;

mod ticket;
use ticket::{create::*, transfer::*};

////////////////////////////////////////////////////////////////////////////////

declare_id!("ExAzZQ8rEFwiTHybeRwMGzGiheMm4TtsNwy5KwwH4cqd");

////////////////////////////////////////////////////////////////////////////////

#[program]
pub mod utils {
    use super::*;

    pub fn create_ticket(ctx: Context<CreateTicketAccounts>, args: CreateTicketArgs) -> Result<()> {
        create_ticket_impl(ctx, args)
    }

    pub fn transfer_ticket(
        ctx: Context<TransferTicketAccounts>,
        args: TransferTicketArgs,
    ) -> Result<()> {
        transfer_ticket_impl(ctx, args)
    }
}
