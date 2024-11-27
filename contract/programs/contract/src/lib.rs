use anchor_lang::prelude::*;

declare_id!("ExAzZQ8rEFwiTHybeRwMGzGiheMm4TtsNwy5KwwH4cqd");

#[program]
pub mod contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
