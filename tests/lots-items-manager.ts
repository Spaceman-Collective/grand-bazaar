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

  const program = anchor.workspace.LotsItemsManager as Program<GrandBazaar>;

  const MPLProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")

  // Generate a unique game_id for the test
  const game_id = Math.floor(Math.random() * 1000000);
  const game_id_buffer = Buffer.alloc(8);
  game_id_buffer.writeUInt32LE(game_id, 0);
  const game_id_bn = new BN(game_id);

  // it("Is initialized!", async () => {
  //   // Add your test here.
  //   const tx = await program.methods.initialize().rpc();
  //   console.log("Your transaction signature", tx);
  // });

  it("Initialize signer PDA", async () => {
    const key = anchor.AnchorProvider.env().wallet.publicKey;

    const [gamePdaAddress, gamePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("game"), game_id_buffer],
      program.programId
    );

    console.log("Game PDA Address:", gamePdaAddress.toString());
    console.log("Game ID:", game_id);

    const tx = await program.methods.initSigner(game_id_bn).accounts({
      gamePda: gamePdaAddress,
      signer: key,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([]).rpc();

    console.log("Transaction signature:", tx);
  });


  it("Mint item collection", async () => {

    const key = anchor.AnchorProvider.env().wallet.publicKey;
    // const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    // Derive the game PDA address and bump
    const [gamePdaAddress, gamePdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("game"), game_id_buffer],
      program.programId
    );


    // Derive the mint PDA address for the token mint
    const [mintPdaAddress, mintPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("mint"), game_id_buffer],
      program.programId
    );

    // Derive the token account address for the token mint
    const [tokenAccountAddress, tokenAccountPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("token"), game_id_buffer],
      program.programId
    );

    // Derive the master edition account PDA
    const [masterEditionAccountAddress, masterEditionAccountPdaBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        MPLProgram.toBuffer(),
        mintPdaAddress.toBuffer(),
        Buffer.from("edition")
      ],
      MPLProgram
    );

    // Derive the nft metadata account PDA
    const [nftMetadataAccountAddress, nftMetadataAccountPdaBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        MPLProgram.toBuffer(),
        mintPdaAddress.toBuffer()
      ],
      MPLProgram
    );


    console.log("Master Edition Account Address:", masterEditionAccountAddress.toString());
    console.log("NFT Metadata Account Address:", nftMetadataAccountAddress.toString());
    console.log("TOKENACCOUNT:", tokenAccountAddress.toString())
    console.log("Mint key: ", mintPdaAddress.toString());
    console.log("User: ", key.toString());
    console.log("Game PDA Address:", gamePdaAddress.toString());

    const name = "lots"
    const symbol = "LOTS"
    const uri = "www.lots.xyz"

    // Mint the NFT into the ATA
    const tx = await program.methods.mintItemCollection(game_id_bn, name, symbol, uri)
      .accounts({
        mint: mintPdaAddress,
        tokenAccount: tokenAccountAddress,
        gamePda: gamePdaAddress,
        payer: key,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        masterEditionAccount: masterEditionAccountAddress,
        nftMetadata: nftMetadataAccountAddress,
      })
      .rpc();

    console.log("Transaction signature:", tx);

  });

});
