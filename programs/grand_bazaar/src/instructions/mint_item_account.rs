use anchor_lang::prelude::*;

pub fn handler(ctx: Context<MintItemAccount>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct MintItemAccount {}
