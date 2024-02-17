use anchor_lang::prelude::*;

pub fn handler(ctx: Context<MintToItemAccount>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct MintToItemAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
