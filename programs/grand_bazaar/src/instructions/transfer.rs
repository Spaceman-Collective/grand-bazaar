use anchor_lang::prelude::*;

pub fn handler(ctx: Context<Transfer>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct Transfer {}

