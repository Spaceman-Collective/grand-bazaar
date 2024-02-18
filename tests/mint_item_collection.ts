import { Program, web3 } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { BN } from "bn.js";
import { GrandBazaar } from "../target/types/grand_bazaar";
import { InitializedGameType } from "./types";

interface MintItemCollection {
  connection: web3.Connection,
  SIGNER: web3.Keypair,
  program: Program<GrandBazaar>,
  MPLProgram: web3.PublicKey,
  gameId: bigint,
  game: InitializedGameType
}

const mintItemCollection = async (
  { connection, SIGNER, game, MPLProgram, program, gameId }: MintItemCollection
) => {
  const itemId = BigInt(10);
  const metadata = {
    itemId: new BN(itemId.toString()),
    name: "sword",
    symbol: "swd",
    uri: "123"
  };
  await new Promise((resolve) => setTimeout(resolve, 5000)); //wait as soetimes it seems to be failing saying the gamepda is not jet inititalized

  // const itemMintKey = await createMint(connection, SIGNER, game.gamePdaAddress, game.gamePdaAddress, 0);
  const itemMintKey = anchor.web3.Keypair.generate();

  const itemATA = web3.PublicKey.findProgramAddressSync(
      [
          game.gamePdaAddress.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          itemMintKey.publicKey.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];

  const metadataAccount = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPLProgram.toBuffer(),
      itemMintKey.publicKey.toBuffer()
    ],
    MPLProgram
  )[0];

  const masterEditionAccountAddress = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      MPLProgram.toBuffer(),
      itemMintKey.publicKey.toBuffer(),
      Buffer.from("edition")
    ],
    MPLProgram
  )[0];

  const ix = await program.methods.mintItemCollection(new BN(gameId.toString()), metadata).accounts({
    signer: SIGNER.publicKey,
    systemProgram: web3.SystemProgram.programId,
    game: game.gamePdaAddress,
    gameCollectionMint: game.gameMintKey,
    itemAta: itemATA,
    mint: itemMintKey.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    metadataAccount: metadataAccount,
    mplProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
    rentAccount: web3.SYSVAR_RENT_PUBKEY,
    sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
    masterEditionAccount: masterEditionAccountAddress,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
  }).instruction();

  const { blockhash } = await connection.getLatestBlockhash();
  const msg = new web3.TransactionMessage({
    payerKey: SIGNER.publicKey,
    recentBlockhash: blockhash,
    instructions: [ix],
  }).compileToV0Message();

  const tx = new web3.VersionedTransaction(msg);
  tx.sign([SIGNER, itemMintKey]);
  // console.log(Buffer.from(tx.serialize()).toString("base64"));
  // console.log(await connection.simulateTransaction(tx));
  const txSig = await connection.sendTransaction(tx);
  // console.log("Item Master Edition: ", masterEditionAccountAddress.toString());
  return { mintKey: itemMintKey.publicKey, metadataAccount, masterEditionAccount: masterEditionAccountAddress }
}

export default mintItemCollection;