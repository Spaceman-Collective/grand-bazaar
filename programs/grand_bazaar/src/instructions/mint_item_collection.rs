use anchor_lang::prelude::*;

pub fn handler(ctx: Context<MintItemCollection>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct MintItemCollection {}

