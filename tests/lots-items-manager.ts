import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GrandBazaar } from "../target/types/grand_bazaar";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BN from 'bn.js';
import {
	MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

import { SystemProgram, PublicKey } from "@solana/web3.js";

describe("lots-items-manager", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.GrandBazaar as Program<GrandBazaar>;

  const MPLProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")

  // Generate a unique game_id for the test
  const game_id = Math.floor(Math.random() * 1000000);
  const game_id_buffer = Buffer.alloc(8);
  game_id_buffer.writeUInt32LE(game_id, 0);
  const game_id_bn = new BN(game_id_buffer);

  const item_id = Math.floor(Math.random() * 1000000);
  const item_id_buffer = Buffer.alloc(8);
  game_id_buffer.writeUInt32LE(item_id, 0);

  const game_mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const item_collection_mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const key = anchor.AnchorProvider.env().wallet.publicKey;

  it("Initializes game", async () => {

    const [gamePdaAddress, gamePdaBump] = await PublicKey.findProgramAddress(
      [Buffer.from("game"), game_id_buffer],
      program.programId
    );

    const [masterEditionAccountAddress, masterEditionAccountPdaBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        MPLProgram.toBuffer(),
        game_mintKey.publicKey.toBuffer(),
        Buffer.from("edition")
      ],
      MPLProgram
    );

    const [nftMetadataAccountAddress, nftMetadataAccountPdaBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        MPLProgram.toBuffer(),
        game_mintKey.publicKey.toBuffer()
      ],
      MPLProgram
    );

  // Derive the token account address for the token mint
  const [tokenAccountAddress, tokenAccountPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("token"), game_id_buffer],
    program.programId
  );

    const metadata = {
      gameId: new BN(game_id_buffer),
      name: "League of Sol",
      symbol: "LOS",
      uri: "https://example.com/game_metadata.json"
    };


    const tx = await program.methods.initGame(metadata).accounts({
      signer: key,
      systemProgram: SystemProgram.programId,
      game: gamePdaAddress,
      mint: game_mintKey.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      metadataAccount: nftMetadataAccountAddress,
      mplProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      masterEditionAccount:masterEditionAccountAddress,
      token: tokenAccountAddress,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    }).signers([game_mintKey])
    .rpc();

    console.log("Transaction signature:", tx);
  });

  it("mint item_collection", async () => {
    

    const [gamePdaAddress, gamePdaBump] = await PublicKey.findProgramAddress(
      [Buffer.from("game"), game_id_buffer],
      program.programId
    );

    const [masterEditionAccountAddress, masterEditionAccountPdaBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        MPLProgram.toBuffer(),
        item_collection_mintKey.publicKey.toBuffer(),
        Buffer.from("edition")
      ],
      MPLProgram
    );

    const [nftMetadataAccountAddress, nftMetadataAccountPdaBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        MPLProgram.toBuffer(),
        item_collection_mintKey.publicKey.toBuffer()
      ],
      MPLProgram
    );

  // Derive the token account address for the token mint
  const [tokenAccountAddress, tokenAccountPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("token"), item_id_buffer],
    program.programId
  );

    const ItemMetadata = {
      itemId: new BN(item_id_buffer),
      name: "League of Sol",
      symbol: "LOS",
      uri: "https://example.com/game_metadata.json"
    };


    const tx = await program.methods.mintItemCollection(game_id_bn, ItemMetadata).accounts({
      signer: key,
      systemProgram: SystemProgram.programId,
      game: gamePdaAddress,
      gameCollectionMint: game_mintKey.publicKey,
      mint: item_collection_mintKey.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      metadataAccount: nftMetadataAccountAddress,
      mplProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      masterEditionAccount:masterEditionAccountAddress,
      token: tokenAccountAddress,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    }).signers([item_collection_mintKey])
    .rpc();

    console.log("Transaction signature:", tx);
  });
});
  

  // it("Mint item collection", async () => {

  //   const key = anchor.AnchorProvider.env().wallet.publicKey;
  //   // const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

  //    // Derive the game PDA address and bump
  //    const [gamePdaAddress, gamePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
  //     [Buffer.from("game"), game_id_buffer],
  //     program.programId
  //   );
    

  //   // Derive the mint PDA address for the token mint
  //   const [mintPdaAddress, mintPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
  //       [Buffer.from("mint"), game_id_buffer],
  //       program.programId
  //   );

  //   // Derive the token account address for the token mint
  //   const [tokenAccountAddress, tokenAccountPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
  //     [Buffer.from("token"), game_id_buffer],
  //     program.programId
  //   );

  //   // Derive the master edition account PDA
  //   const [masterEditionAccountAddress, masterEditionAccountPdaBump] = await PublicKey.findProgramAddress(
  //     [
  //       Buffer.from("metadata"),
  //       MPLProgram.toBuffer(),
  //       mintPdaAddress.toBuffer(),
  //       Buffer.from("edition")
  //     ],
  //     MPLProgram
  //   );

  //   // Derive the nft metadata account PDA
  //   const [nftMetadataAccountAddress, nftMetadataAccountPdaBump] = await PublicKey.findProgramAddress(
  //     [
  //       Buffer.from("metadata"),
  //       MPLProgram.toBuffer(),
  //       mintPdaAddress.toBuffer()
  //     ],
  //     MPLProgram
  //   );

    
  //   console.log("Master Edition Account Address:", masterEditionAccountAddress.toString());
  //   console.log("NFT Metadata Account Address:", nftMetadataAccountAddress.toString());
  //   console.log("TOKENACCOUNT:", tokenAccountAddress.toString())
  //   console.log("Mint key: ", mintPdaAddress.toString());
  //   console.log("User: ", key.toString());
  //   console.log("Game PDA Address:", gamePdaAddress.toString());

  //   const name = "lots"
  //   const symbol = "LOTS"
  //   const uri = "www.lots.xyz"

  //   // Mint the NFT into the ATA
  //   const tx = await program.methods.mintItemCollection(game_id_bn, name, symbol, uri)
  //   .accounts({
  //     mint: mintPdaAddress,
  //     tokenAccount: tokenAccountAddress,
  //     gamePda: gamePdaAddress,
  //     payer: key,
  //     systemProgram: SystemProgram.programId,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //     tokenProgram:TOKEN_PROGRAM_ID,
  //     metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
  //     masterEditionAccount: masterEditionAccountAddress,
  //     nftMetadata: nftMetadataAccountAddress,
  //   })
  //   .rpc();

  // console.log("Transaction signature:", tx);

  // });

