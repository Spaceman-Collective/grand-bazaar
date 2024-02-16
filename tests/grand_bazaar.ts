import { web3, Program, BN } from "@coral-xyz/anchor";
import { GrandBazaar } from "../target/types/grand_bazaar";
const IDL = require("../target/idl/grand_bazaar.json");
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { randomU64 } from "./util";
import { readFileSync } from 'fs';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { serializeUint64, ByteifyEndianess } from "byteify";

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
        await new Promise((resolve) => setTimeout(resolve, 5000)); //wait for airdrop to go through
        const gamePdaAddress = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("game"), gameIdBuffer],
            program.programId
        )[0];
        const gameMintKey = await createMint(connection, SIGNER, gamePdaAddress, gamePdaAddress, 0);
        const gameATA = (await getOrCreateAssociatedTokenAccount(connection, SIGNER, gameMintKey, gamePdaAddress, true)).address;

        const masterEditionAccountAddress = web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                MPLProgram.toBuffer(),
                gameMintKey.toBuffer(),
                Buffer.from("edition")
            ],
            MPLProgram
        )[0];

        const nftMetadataAccountAddress = web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                MPLProgram.toBuffer(),
                gameMintKey.toBuffer()
            ],
            MPLProgram
        )[0];

        // Derive the token account address for the token mint
        const tokenAccountAddress = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("token"), gameIdBuffer],
            program.programId
        )[0];

        const metadata = {
            gameId: new BN(gameId.toString()),
            name: "Legends of the Sun",
            symbol: "LOTS",
            uri: "https://example.com/game_metadata.json"
        };


        const ix = await program.methods.initGame(metadata).accounts({
            signer: SIGNER.publicKey,
            systemProgram: web3.SystemProgram.programId,
            game: gamePdaAddress,
            mint: gameMintKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataAccount: nftMetadataAccountAddress,
            mplProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
            masterEditionAccount: masterEditionAccountAddress,
            ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            sysvarInstructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            rentAccount: web3.SYSVAR_RENT_PUBKEY,
            gameAta: gameATA
        })
            .instruction();

        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash();


        const msg = new web3.TransactionMessage({
            payerKey: SIGNER.publicKey,
            recentBlockhash: blockhash,
            instructions: [ix],
        }).compileToV0Message();

        const tx = new web3.VersionedTransaction(msg);
        tx.sign([SIGNER])
        console.log(Buffer.from(tx.serialize()).toString("base64"));
        console.log(await connection.simulateTransaction(tx));
        const txSig = await connection.sendTransaction(tx)
        console.log("TX SIG: ", txSig);
    })
});