use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use mpl_token_metadata::{
    instructions::{CreateV1CpiBuilder, MintV1CpiBuilder},
    types::{Collection, PrintSupply, TokenStandard},
    ID as MPL_TOKEN_METADATA_ID,
};

use crate::*;
/**
 * This function should mint an item collection NFT settings *its* collection to the Game NFT
 */
pub fn handler(
    ctx: Context<MintItemCollection>,
    game_id: u64,
    metadata: ItemMetadata,
) -> Result<()> {
    let gid = game_id.to_le_bytes();
    // Create game collection metadata
    let game_setting_seeds: &[&[u8]] = &[gid.as_ref(), &[ctx.bumps.game]];
    let signer_seeds = &[game_setting_seeds];

    // Creates metadata, master edition, and mints to
    CreateV1CpiBuilder::new(&ctx.accounts.mpl_program.to_account_info())
        .metadata(&ctx.accounts.metadata_account.to_account_info())
        .mint(&ctx.accounts.mint.to_account_info(), false)
        .authority(&ctx.accounts.game.to_account_info())
        .payer(&ctx.accounts.signer.to_account_info())
        .update_authority(&ctx.accounts.game.to_account_info(), true)
        .master_edition(Some(&ctx.accounts.master_edition_account.to_account_info()))
        .system_program(&ctx.accounts.system_program)
        .sysvar_instructions(&ctx.accounts.sysvar_account.to_account_info())
        .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
        .token_standard(TokenStandard::NonFungible)
        .collection(Collection {
            verified: true,
            key: ctx.accounts.game_collection_mint.key(),
        })
        .uri(metadata.uri)
        .name(metadata.name)
        .seller_fee_basis_points(0)
        .print_supply(PrintSupply::Zero)
        .invoke_signed(signer_seeds)
        .unwrap();

    // Mints the NFT to the Game PDA
    MintV1CpiBuilder::new(&ctx.accounts.mpl_program.to_account_info())
        .token(&ctx.accounts.token.to_account_info())
        .token_owner(Some(&ctx.accounts.game.to_account_info()))
        .metadata(&ctx.accounts.metadata_account.to_account_info())
        .master_edition(Some(&ctx.accounts.master_edition_account.to_account_info()))
        .mint(&ctx.accounts.mint.to_account_info())
        .payer(&ctx.accounts.signer)
        .authority(&ctx.accounts.game.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .sysvar_instructions(&ctx.accounts.sysvar_account.to_account_info())
        .spl_token_program(&ctx.accounts.token_program.to_account_info())
        .spl_ata_program(&ctx.accounts.ata_program.to_account_info())
        .amount(1)
        .invoke_signed(signer_seeds)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(metadata:GameMetadata)]
pub struct MintItemCollection<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        seeds = [b"game".as_ref(), metadata.game_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub game: Box<Account<'info, GamePDA>>,
    pub game_collection_mint: Box<Account<'info, Mint>>,

    // SPL Mint - Random Keypair generation
    #[account(
        init,
        payer=signer,
        mint::decimals = 0,
        mint::authority = game,
        mint::freeze_authority = game
    )]
    pub mint: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,

    // Metadata
    /// CHECK: Metadata program will create it
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: This is a program. and we check it. gud comment
    #[account(address = MPL_TOKEN_METADATA_ID)]
    pub mpl_program: UncheckedAccount<'info>,

    /// CHECK: This is a program. and we check it. gud comment
    pub sysvar_account: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            b"metadata".as_ref(),
            mpl_program.key().as_ref(),
            mint.key().as_ref(),
            b"edition".as_ref(),
        ],
        bump,
        seeds::program = mpl_program.key()
      )]
    /// CHECK: IDK man this is some metaplex shit
    pub master_edition_account: UncheckedAccount<'info>,

    // Minting NFT
    pub token: Account<'info, TokenAccount>,
    pub ata_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ItemMetadata {
    pub item_id: u64,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
