// import { web3, Program, BN } from "@coral-xyz/anchor";
// import { GrandBazaar } from "../target/types/grand_bazaar";
// const IDL = require("../target/idl/grand_bazaar.json");
// import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
// import { randomU64 } from "./util";
// import { readFileSync } from 'fs';
// import { serializeUint64, ByteifyEndianess } from "byteify";
// import initializeGame from "./initialize_game";

// const connection = new web3.Connection("http://localhost:8899", "confirmed");
// const program: Program<GrandBazaar> = new Program<GrandBazaar>(IDL, "BXNayNJzpQoWuAmXbj5gVMAAxVR8HqZWCtokuZM3kVAZ", { connection });
// const SIGNER = web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync('./keypairs/testing_pair.json').toString())));

// describe("Item Collection Mint", () => {
//   const gameIdInt = BigInt(10); // randomU64();
//   const gameIdBuffer = Uint8Array.from(serializeUint64(gameIdInt, { endianess: ByteifyEndianess.LITTLE_ENDIAN }));
//   const MPLProgram = new web3.PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString())
//   const game_id: BN = new BN(gameIdInt.toString());

//   before(() => {
//     connection.requestAirdrop(SIGNER.publicKey, 100 * web3.LAMPORTS_PER_SOL); // request aridrop
//   })
  
//   it("mints the collection successfully", async () => {

//   });
// });
