use anchor_lang::prelude::*;



#[account]
pub struct GamePda {
    pub game_id: u64,
    pub authority: Pubkey,
}