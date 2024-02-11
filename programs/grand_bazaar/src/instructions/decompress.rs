use anchor_lang::prelude::*;

pub fn handler(ctx: Context<Decompress>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct Decompress {}

