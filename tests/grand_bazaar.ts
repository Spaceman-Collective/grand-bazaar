import { web3, Program, BN } from "@coral-xyz/anchor";
import { GrandBazaar } from "../target/types/grand_bazaar";
const IDL = require("../target/idl/grand_bazaar.json");
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { randomU64 } from "./util";
import { readFileSync } from 'fs';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const connection = new web3.Connection("http://localhost:8899", "confirmed");

const program: Program<GrandBazaar> = new Program<GrandBazaar>(IDL, "492EodhvjLq63FAsEKYtuULsKec1nmF2K526MBWrTBSz", { connection })

const SIGNER = web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync('./keypairs/testing_pair.json').toString())));
console.log("Using signer: ", SIGNER.publicKey.toString());
connection.requestAirdrop(SIGNER.publicKey, 100 * web3.LAMPORTS_PER_SOL);

describe("grand_bazaar", () => {
    const gameId = randomU64();
    const gameIdBuffer: Buffer = Buffer.alloc(8);
    gameIdBuffer.writeBigUInt64LE(gameId, 0);
    const MPLProgram = new web3.PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID.toString());
    const gameMintKey = web3.Keypair.generate();

    it("initializes a game", async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000)); //wait for airdrop to go through
        const gamePdaAddress = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("game"), gameIdBuffer],
            program.programId
        )[0];

        const masterEditionAccountAddress = web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                MPLProgram.toBuffer(),
                gameMintKey.publicKey.toBuffer(),
                Buffer.from("edition")
            ],
            MPLProgram
        )[0];

        const nftMetadataAccountAddress = web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                MPLProgram.toBuffer(),
                gameMintKey.publicKey.toBuffer()
            ],
            MPLProgram
        )[0];

        // Derive the token account address for the token mint
        const tokenAccountAddress = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("token"), gameIdBuffer],
            program.programId
        )[0];

        const metadata = {
            gameId: new BN(gameIdBuffer),
            name: "Legends of the Sun",
            symbol: "LOTS",
            uri: "https://example.com/game_metadata.json"
        };


        const ix = await program.methods.initGame(metadata).accounts({
            signer: SIGNER.publicKey,
            systemProgram: web3.SystemProgram.programId,
            game: gamePdaAddress,
            mint: gameMintKey.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            metadataAccount: nftMetadataAccountAddress,
            mplProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
            masterEditionAccount: masterEditionAccountAddress,
            token: tokenAccountAddress,
            ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            sysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY
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
        tx.sign([SIGNER, gameMintKey])
        const txSig = await connection.sendTransaction(tx)
        console.log("TX SIG: ", txSig);
    })


})
