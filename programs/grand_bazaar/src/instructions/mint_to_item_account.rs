use crate::*;
use anchor_lang::prelude::*;
use mpl_bubblegum::types::MetadataArgs;

use self::schemas::CompressedTokenAccount;

pub fn handler(
    ctx: Context<MintToItemAccount>,
    metadata_args: MetadataArgs,
    amount_increment: u64,
) -> Result<()> {
    let compressed_buffer: Vec<u8> = metadata_args.uri.chars().map(|c| c as u8).collect();
    //let compressed_token_acc = CompressedTokenAccount::try_from(compressed_buffer.as_slice());

    Ok(())
}

#[derive(Accounts)]
pub struct MintToItemAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
