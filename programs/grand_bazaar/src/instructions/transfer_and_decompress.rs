use anchor_lang::prelude::*;

pub fn handler(ctx: Context<TransferAndDecompress>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct TransferAndDecompress {}
