use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::{
    instructions::{
        CreateMasterEditionV3Cpi, CreateMasterEditionV3CpiAccounts,
        CreateMasterEditionV3InstructionArgs, CreateMetadataAccountV3Cpi,
        CreateMetadataAccountV3CpiAccounts, CreateMetadataAccountV3InstructionArgs,
    },
    types::{Collection, DataV2},
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
    let seeds = &[b"game".as_ref(), &gid, &[ctx.bumps.game]];
    let signer_seeds = &[&seeds[..]];

    // Mint Token
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.game_ata.to_account_info(),
                authority: ctx.accounts.game.to_account_info(),
            },
            signer_seeds,
        ),
        1,
    )
    .unwrap();

    // Create Metadata
    CreateMetadataAccountV3Cpi::new(
        &ctx.accounts.mpl_program.to_account_info(),
        CreateMetadataAccountV3CpiAccounts {
            payer: &ctx.accounts.signer.to_account_info(),
            metadata: &ctx.accounts.metadata_account.to_account_info(),
            mint: &ctx.accounts.mint.to_account_info(),
            mint_authority: &ctx.accounts.game.to_account_info(),
            update_authority: (&ctx.accounts.game.to_account_info(), true),
            system_program: &ctx.accounts.system_program.to_account_info(),
            rent: None,
        },
        CreateMetadataAccountV3InstructionArgs {
            data: DataV2 {
                name: metadata.name.to_string().clone(),
                symbol: metadata.symbol.to_string().clone(),
                seller_fee_basis_points: 0,
                creators: None,
                uri: metadata.uri.to_string().clone().to_string(),
                collection: Some(Collection {
                    verified: true,
                    key: ctx.accounts.game_collection_mint.key(),
                }),
                uses: None,
            },
            is_mutable: false,
            collection_details: None,
        },
    )
    .invoke_signed(signer_seeds)?;

    // Create Master Edition
    CreateMasterEditionV3Cpi::new(
        &ctx.accounts.mpl_program.to_account_info(),
        CreateMasterEditionV3CpiAccounts {
            edition: &ctx.accounts.master_edition_account.to_account_info(),
            mint: &ctx.accounts.mint.to_account_info(),
            update_authority: &ctx.accounts.game.to_account_info(),
            mint_authority: &ctx.accounts.game.to_account_info(),
            payer: &ctx.accounts.signer.to_account_info(),
            metadata: &ctx.accounts.metadata_account.to_account_info(),
            token_program: &ctx.accounts.token_program.to_account_info(),
            system_program: &ctx.accounts.system_program.to_account_info(),
            rent: Some(&ctx.accounts.rent_account.to_account_info()),
        },
        CreateMasterEditionV3InstructionArgs {
            max_supply: Some(1),
        },
    )
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
        init,
        payer = signer,
        space = 8 + GamePDA::get_max_size(),
        seeds = [b"game".as_ref(), metadata.game_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub game: Account<'info, GamePDA>,
    pub game_collection_mint: Account<'info, Mint>,
    #[account(mut)]
    pub game_ata: Account<'info, TokenAccount>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,

    // Metadata
    /// CHECK: Metadata program will create it
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: This is a program. and we check it. gud comment
    #[account(address = MPL_TOKEN_METADATA_ID)]
    pub mpl_program: AccountInfo<'info>,
    pub rent_account: Sysvar<'info, Rent>,
    /// CHECK: sysvar
    pub sysvar_instructions: AccountInfo<'info>,

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
    pub ata_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ItemMetadata {
    pub item_id: u64,
    pub name: String,
    pub symbol: String,
    pub uri: String,
}
