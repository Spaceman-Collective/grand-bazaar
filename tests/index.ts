import { web3, Program, BN } from "@coral-xyz/anchor";
import { GrandBazaar } from "../target/types/grand_bazaar";
const IDL = require("../target/idl/grand_bazaar.json");
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { randomU64 } from "./util";
import { readFileSync } from 'fs';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { serializeUint64, ByteifyEndianess } from "byteify";
import initializeGame from "./initialize_game";

const connection = new web3.Connection("http://localhost:8899", "confirmed");

const program: Program<GrandBazaar> = new Program<GrandBazaar>(IDL, "BXNayNJzpQoWuAmXbj5gVMAAxVR8HqZWCtokuZM3kVAZ", { connection })

const SIGNER = web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync('./keypairs/testing_pair.json').toString())));
console.log("Using signer: ", SIGNER.publicKey.toString());
connection.requestAirdrop(SIGNER.publicKey, 100 * web3.LAMPORTS_PER_SOL);

describe("grand_bazaar", () => {
    const gameId = BigInt(10); //randomU64();
    const gameIdBuffer = Uint8Array.from(serializeUint64(gameId, { endianess: ByteifyEndianess.LITTLE_ENDIAN }));
    const MPLProgram = new web3.PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString());


    it("initializes a game", async () => {
      initializeGame({ gameId, SIGNER, connection, MPLProgram, gameIdBuffer, program });
    })
});