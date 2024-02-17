import { web3, Program, BN, AnchorError } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { GrandBazaar } from "../target/types/grand_bazaar";
const IDL = require("../target/idl/grand_bazaar.json");
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { randomU64 } from "./util";
import { readFileSync } from 'fs';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { serializeUint64, ByteifyEndianess } from "byteify";
import initializeGame from "./initialize_game";
import { InitializedGameType } from "./types";

const connection = new web3.Connection("http://localhost:8899", "confirmed");

const program: Program<GrandBazaar> = new Program<GrandBazaar>(IDL, "BXNayNJzpQoWuAmXbj5gVMAAxVR8HqZWCtokuZM3kVAZ", { connection })

const SIGNER = web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync('./keypairs/testing_pair.json').toString())));
console.log("Using signer: ", SIGNER.publicKey.toString());
connection.requestAirdrop(SIGNER.publicKey, 100 * web3.LAMPORTS_PER_SOL);


describe("grand_bazaar", () => {
  const gameId = BigInt(10); //randomU64();
  const gameIdBuffer = Uint8Array.from(serializeUint64(gameId, { endianess: ByteifyEndianess.LITTLE_ENDIAN }));
  const MPLProgram = new web3.PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString());

  // let game: InitializedGameType; // to reference later throughout the tests

  // it("initializes a game", async () => {
  //   // game = await initializeGame({ gameId, SIGNER, connection, MPLProgram, gameIdBuffer, program });
  // });

  it("collection mint item", async () => {
    // let game: InitializedGameType; // to reference later throughout the tests
    console.log("CALLING GAME");
    let game: InitializedGameType = await initializeGame({ gameId, SIGNER, connection, MPLProgram, gameIdBuffer, program });
    console.log("GAME RETURNS");

    const itemId = BigInt(10);
    const metadata = {
      itemId: new BN(itemId.toString()),
      name: "sword",
      symbol: "swd",
      uri: "123"
    };
    console.log(game);

    await new Promise((resolve) => setTimeout(resolve, 5000)); //wait for tx beeing trough and game pda is created

    const itemPdaAdress = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game"), gameIdBuffer],
      program.programId
    )[0];

    const item_collection_mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    // const itemMintKey = await createMint(connection, SIGNER, game.gamePdaAddress, game.gamePdaAddress, 0);
    const metadataAccount = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        MPLProgram.toBuffer(),
        item_collection_mintKey.publicKey.toBuffer()
      ],
      MPLProgram
    )[0];

    const masterEditionAccountAddress = web3.PublicKey.findProgramAddressSync(
      [
          Buffer.from("metadata"),
          MPLProgram.toBuffer(),
          item_collection_mintKey.publicKey.toBuffer(),
          Buffer.from("edition")
      ],
      MPLProgram
    )[0];

    // Derive the token account address for the item tokenaccount
    const item_ata = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("token"), 
        gameIdBuffer,
        item_collection_mintKey.publicKey.toBuffer()
      ],
      program.programId
    )[0];

    console.log('generating ix');

    const ix = await program.methods.mintItemCollection(new BN(gameId.toString()), metadata).accounts({
      signer: SIGNER.publicKey,
      systemProgram: web3.SystemProgram.programId,
      game: game.gamePdaAddress,
      gameCollectionMint: game.gameMintKey,
      itemAta: item_ata,
      mint: item_collection_mintKey.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      metadataAccount: metadataAccount,
      mplProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      rentAccount: web3.SYSVAR_RENT_PUBKEY,
      sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      masterEditionAccount: masterEditionAccountAddress,
    }).instruction();

    console.log('instruction generated')

    const { blockhash } = await connection.getLatestBlockhash();
    console.log('got blockhash')
    const msg = new web3.TransactionMessage({
      payerKey: SIGNER.publicKey,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToV0Message();

    console.log('msg received')

    const tx = new web3.VersionedTransaction(msg);
    tx.sign([SIGNER, item_collection_mintKey]);
    console.log(Buffer.from(tx.serialize()).toString("base64"));
    console.log(await connection.simulateTransaction(tx));
    const txSig = await connection.sendTransaction(tx);
    
    console.log("TX SIG: ", txSig);
  });

  // it("init an item account", async () => {
  //   mintItemAccount({ gameId, SIGNER, connection, MPLProgram, itemCollectionMint, itemCollectionMetadata, itemCollectionEdition, gameIdBuffer, program });
  // });

});