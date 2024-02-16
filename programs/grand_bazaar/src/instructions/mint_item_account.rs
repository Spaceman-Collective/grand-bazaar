use crate::*;
use anchor_lang::prelude::*;
use mpl_bubblegum::instructions::MintToCollectionV1CpiBuilder;

pub fn handler(ctx: Context<MintItemAccount>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct MintItemAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        constraint = game.authority == signer.key()
    )]
    pub game: Box<Account<'info, GamePDA>>,
}
