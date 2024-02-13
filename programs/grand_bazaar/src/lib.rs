mod instructions;
mod state;

use anchor_lang::prelude::*;
use instructions::*;
use state::*;
declare_id!("492EodhvjLq63FAsEKYtuULsKec1nmF2K526MBWrTBSz");

#[program]
pub mod grand_bazaar {
    use super::*;

    /* Compressed Tradables */
    pub fn init_game(ctx: Context<InitGame>, metadata: GameMetadata) -> Result<()> {
        init_game::handler(ctx, metadata).unwrap();
        Ok(())
    }

    pub fn mint_item_collection(
        ctx: Context<MintItemCollection>,
        game_id: u64,
        metadata: ItemMetadata,
    ) -> Result<()> {
        mint_item_collection::handler(ctx, game_id, metadata).unwrap();
        Ok(())
    }

    pub fn mint_item_account(ctx: Context<MintItemAccount>) -> Result<()> {
        mint_item_account::handler(ctx).unwrap();
        Ok(())
    }

    pub fn mint_to_item_account(ctx: Context<MintToItemAccount>) -> Result<()> {
        mint_to_item_account::handler(ctx).unwrap();
        Ok(())
    }

    pub fn transfer(ctx: Context<Transfer>) -> Result<()> {
        transfer::handler(ctx).unwrap();
        Ok(())
    }

    pub fn burn(ctx: Context<Burn>) -> Result<()> {
        burn::handler(ctx).unwrap();
        Ok(())
    }

    pub fn compress(ctx: Context<Compress>) -> Result<()> {
        compress::handler(ctx).unwrap();
        Ok(())
    }

    pub fn decompress(ctx: Context<Decompress>) -> Result<()> {
        decompress::handler(ctx).unwrap();
        Ok(())
    }

    pub fn transfer_and_decompress(ctx: Context<TransferAndDecompress>) -> Result<()> {
        transfer_and_decompress::handler(ctx).unwrap();
        Ok(())
    }

    /* Grand Bazaar */
}
