use anchor_lang::prelude::*;

mod ticket;
use ticket::{create::*, create_collection::*, create_v1::*, transfer::*, transfer_v1::*};

////////////////////////////////////////////////////////////////////////////////

declare_id!("ExAzZQ8rEFwiTHybeRwMGzGiheMm4TtsNwy5KwwH4cqd");

////////////////////////////////////////////////////////////////////////////////

#[program]
pub mod utils {
    use super::*;

    pub fn create_ticket(ctx: Context<CreateTicketAccounts>, args: CreateTicketArgs) -> Result<()> {
        create_ticket_impl(ctx, args)
    }

    pub fn create_ticket_v1(
        ctx: Context<Accounts4CreateTicketV1>,
        args: Args4CreateTicketV1,
    ) -> Result<()> {
        create_ticket_v1_impl(ctx, args)
    }

    pub fn transfer_ticket(
        ctx: Context<TransferTicketAccounts>,
        args: TransferTicketArgs,
    ) -> Result<()> {
        transfer_ticket_impl(ctx, args)
    }

    pub fn transfer_ticket_v1(
        ctx: Context<Accounts4TransferTicketV1>,
        args: Args4TransferTicketV1,
    ) -> Result<()> {
        transfer_ticket_v1_impl(ctx, args)
    }

    ////////////////////////////////////////////////////////////////////////////

    pub fn create_collection(
        ctx: Context<CreateCollectionAccounts>,
        args: CreateCollectionArgs,
    ) -> Result<()> {
        create_collection_impl(ctx, args)
    }
}
