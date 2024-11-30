use anchor_lang::prelude::*;

mod ticket;
use ticket::create::*;

////////////////////////////////////////////////////////////////////////////////

declare_id!("ExAzZQ8rEFwiTHybeRwMGzGiheMm4TtsNwy5KwwH4cqd");

////////////////////////////////////////////////////////////////////////////////
/// Ref: https://developers.metaplex.com/core/guides/anchor/how-to-create-a-core-nft-asset-with-anchor

#[program]
pub mod utils {
    use super::*;

    pub fn create_ticket(ctx: Context<CreateTicketAccounts>, args: CreateTicketArgs) -> Result<()> {
        create_ticket_impl(ctx, args)
    }
}

