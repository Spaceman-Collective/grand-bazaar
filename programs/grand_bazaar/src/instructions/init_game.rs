use anchor_lang::prelude::*;
use crate::*;

pub fn handler(ctx: Context<InitGame>,  game_id: u64) -> Result<()> {
    
    let game_pda = &mut ctx.accounts.game_pda;
    game_pda.game_id = game_id;
    game_pda.authority = ctx.accounts.signer.key();

    Ok(())
}

#[derive(Accounts)]
#[instruction(game_id:u64)]
pub struct InitGame<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        init,
        payer = signer,
        space = 8 + GamePDA::get_max_size(),
        seeds = [b"game", game_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub game_pda: Account<'info, GamePDA>,
}

