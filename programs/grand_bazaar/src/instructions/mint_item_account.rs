
use crate::*;
use anchor_lang::prelude::*;
use base64::prelude::*;
use anchor_spl::token::Mint;
use mpl_bubblegum::{instructions::MintToCollectionV1CpiBuilder, types::{Collection, MetadataArgs, TokenProgramVersion}};
use mpl_token_metadata::{accounts::Metadata, ID as MPL_TOKEN_METADATA_ID};
use spl_account_compression::{program::SplAccountCompression, Noop};

pub fn handler(ctx: Context<MintItemAccount>, game_id: u64, init_data: Vec<u8>) -> Result<()> {
    let gid = game_id.to_le_bytes();
    let seeds = &[b"game".as_ref(), &gid, &[ctx.bumps.game]];
    let signer_seeds = &[&seeds[..]];

    let ds_data= ctx.accounts.item_collection_metadata.try_borrow_data()?;
    let item_metadata = Metadata::safe_deserialize(&ds_data)?;

    let data_str = BASE64_STANDARD.encode(init_data);
    if data_str.len() > 200 {
        return err!(MintItemAccountErrors::InitDataLenExceedsMaxSize)
    }
    drop(ds_data);
    

    MintToCollectionV1CpiBuilder::new(
        &ctx.accounts.bubblegum_program.to_account_info()
    )
        .tree_config(&ctx.accounts.tree_authority.to_account_info())
        .leaf_owner(&ctx.accounts.new_leaf_owner.to_account_info())
        .leaf_delegate(&ctx.accounts.new_leaf_owner.to_account_info())
        .merkle_tree(&ctx.accounts.merkle_tree.to_account_info())
        .payer(&ctx.accounts.signer.to_account_info())
        .tree_creator_or_delegate(&ctx.accounts.signer.to_account_info())
        .collection_authority(&ctx.accounts.game.to_account_info())
        .collection_mint(&ctx.accounts.item_collection_mint.to_account_info())
        .collection_metadata(&ctx.accounts.item_collection_metadata.to_account_info())
        .collection_edition(&ctx.accounts.item_collection_edition.to_account_info())
        .bubblegum_signer(&ctx.accounts.bubblegum_signer.to_account_info())
        .log_wrapper(&ctx.accounts.log_wrapper.to_account_info())
        .compression_program(&ctx.accounts.compression_program.to_account_info())
        .token_metadata_program(&ctx.accounts.mpl_program.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .metadata(MetadataArgs {
            name: item_metadata.name,
            symbol: item_metadata.symbol,
            uri: data_str,
            seller_fee_basis_points: 0,
            primary_sale_happened: true,
            is_mutable: true,
            edition_nonce: None,
            token_standard: None,
            collection: Some(Collection {verified: false, key: ctx.accounts.item_collection_mint.key()}),
            uses: None,
            token_program_version: TokenProgramVersion::Original,
            creators: vec![]
        }).invoke_signed(signer_seeds)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(game_id:u64, init_data: Vec<u8>)]
pub struct MintItemAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        constraint = game.authority == signer.key(),
        seeds = [b"game".as_ref(), game_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub game: Account<'info, GamePDA>,

    pub item_collection_mint: Account<'info, Mint>,
    /// CHECK: Metaplex Metadata Acc
    #[account(mut)]
    pub item_collection_metadata: AccountInfo<'info>,
    /// CHECK: Metaplex Master Edition Acc
    pub item_collection_edition: AccountInfo<'info>,

    // Mint Bubblegum NFT
    #[account(
        seeds = [merkle_tree.key().as_ref()],
        bump, 
        seeds::program = bubblegum_program.key()
      )]
    /// CHECK: This account is neither written to nor read from.
    #[account(mut)]
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: This account is neither written to nor read from.
    pub new_leaf_owner: UncheckedAccount<'info>, // receiver
    #[account(mut)]
    /// CHECK: This account is modified in the downstream program
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    /// CHECK: Checked via ID
    #[account(address = mpl_bubblegum::ID)]
    pub bubblegum_program: UncheckedAccount<'info>,
    /// CHECK: This is a program. and we check it. gud comment
    #[account(address = MPL_TOKEN_METADATA_ID)]
    pub mpl_program: AccountInfo<'info>,
    /// CHECK: Blah
    pub bubblegum_signer: AccountInfo<'info>
}

#[error_code]
pub enum MintItemAccountErrors {
    #[msg("")]
    InitDataLenExceedsMaxSize,
}