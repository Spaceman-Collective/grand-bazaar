import { web3, Program, BN } from "@coral-xyz/anchor";
import { GrandBazaar } from "../target/types/grand_bazaar";
const IDL = require("../target/idl/grand_bazaar.json");
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { randomU64 } from "./util";
import { readFileSync } from 'fs';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { serializeUint64, ByteifyEndianess } from "byteify";
import initializeGame from "./initialize_game";
import { InitializedGameType } from "./types";
import { assert, expect } from "chai";
import mintItemCollection from "./mint_item_collection";

const connection = new web3.Connection("http://localhost:8899", "confirmed");

const program: Program<GrandBazaar> = new Program<GrandBazaar>(IDL, "BXNayNJzpQoWuAmXbj5gVMAAxVR8HqZWCtokuZM3kVAZ", { connection })

const SIGNER = web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync('./keypairs/testing_pair.json').toString())));
console.log("Using signer: ", SIGNER.publicKey.toString());
connection.requestAirdrop(SIGNER.publicKey, 100 * web3.LAMPORTS_PER_SOL);


describe("grand_bazaar", () => {
  const gameId = BigInt(10); // randomU64();
  const gameIdBuffer = Uint8Array.from(serializeUint64(gameId, { endianess: ByteifyEndianess.LITTLE_ENDIAN }));
  const MPLProgram = new web3.PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString());

  let game: InitializedGameType; // to reference later throughout the tests

  before(async () => {
    game = await initializeGame({ gameId, SIGNER, connection, MPLProgram, gameIdBuffer, program });
  });

  it("initializes a game", async () => {
    expect(game).to.exist;
  });

  it("mint item collection", async () => {
    await mintItemCollection({ connection, SIGNER, game, gameId, MPLProgram, program });
  });

  // it("init an item account", async () => {
  //   mintItemAccount({ gameId, SIGNER, connection, MPLProgram, itemCollectionMint, itemCollectionMetadata, itemCollectionEdition, gameIdBuffer, program });
  // });

});