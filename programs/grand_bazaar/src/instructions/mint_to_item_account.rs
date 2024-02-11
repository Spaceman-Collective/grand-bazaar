use anchor_lang::prelude::*;

pub fn handler(ctx: Context<MintToItemAccount>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct MintToItemAccount {}

