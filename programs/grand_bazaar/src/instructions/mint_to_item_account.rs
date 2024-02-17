use crate::schemas::CompressedTokenAccount;
use anchor_lang::prelude::*;
use mpl_bubblegum::types::MetadataArgs;

pub fn handler(
    ctx: Context<MintToItemAccount>,
    metadata_args: MetadataArgs,
    amt_increment: u64,
) -> Result<()> {
    let compressed_buffer: Vec<u8> = metadata_args.uri.chars().map(|c| c as u8).collect();
    let compressed_account: CompressedTokenAccount =
        flatbuffers::root::<CompressedTokenAccount>(&compressed_buffer).unwrap();
    let new_amt = compressed_account.amount() + amt_increment;

    Ok(())
}

#[derive(Accounts)]
pub struct MintToItemAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
