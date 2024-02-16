import { web3, Program, BN } from "@coral-xyz/anchor";
import { GrandBazaar } from "../target/types/grand_bazaar";
const IDL = require("../target/idl/grand_bazaar.json");
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { randomU64 } from "./util";
import { readFileSync } from 'fs';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { serializeUint64, ByteifyEndianess } from "byteify";

import { PublicKey } from "@solana/web3.js";

import { generateSigner } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createTree } from '@metaplex-foundation/mpl-bubblegum'

import {MPL_BUBBLEGUM_PROGRAM_ID, TokenProgramVersion} from "@metaplex-foundation/mpl-bubblegum";
import { SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, SPL_NOOP_PROGRAM_ID, ValidDepthSizePair, getConcurrentMerkleTreeAccountSize } from "@solana/spl-account-compression";

const connection = new web3.Connection("http://localhost:8899", "confirmed");

const program: Program<GrandBazaar> = new Program<GrandBazaar>(IDL, "BXNayNJzpQoWuAmXbj5gVMAAxVR8HqZWCtokuZM3kVAZ", { connection })

const SIGNER = web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync('./keypairs/testing_pair.json').toString())));
console.log("Using signer: ", SIGNER.publicKey.toString());
connection.requestAirdrop(SIGNER.publicKey, 100 * web3.LAMPORTS_PER_SOL);

const umi = createUmi(connection);

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

    it("init item account", async () => {
        
        //create merkle tree
        const merkleTree = generateSigner(umi)
        const builder = await createTree(umi, { 
            merkleTree,
            maxDepth: 14, //this tree would allow around 10k item accounts to be minted
            maxBufferSize: 64,
        })
        await builder.sendAndConfirm(umi)

        console.log("Merkle Tree:", merkleTree.publicKey)

        const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
            [new PublicKey(merkleTree.publicKey).toBuffer()],
            new PublicKey("BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"),
        );
        
        const gamePdaAddress = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("game"), gameIdBuffer],
            program.programId
        )[0];

        // Item data
        const accountData = {
            ItemCollection:"itemCollectionMint",
            Amount: "1",
        };
        const dataStr = JSON.stringify(accountData);
        const init_data = new TextEncoder().encode(dataStr);

        // has to be smaller than 200 bytes
        if (init_data.length > 199) {
            throw new Error("init_data exceeds the maximum allowed length.");
        }


        const ix = await program.methods.mintItemAccount(gameId, init_data).accounts({
            signer: SIGNER.publicKey,
            systemProgram: web3.SystemProgram.programId,
            game: gamePdaAddress,
            itemCollectionMint:, // mint acc item collection
            itemCollectionMetadata:, //metadataaccount item collection
            itemCollectionEdition:, //masteredition account item collection
            tree_authority: treeAuthority,
            newLeafOwner: SIGNER.publicKey,
            merkle_tree: new PublicKey(merkleTree.publicKey),
            log_wrapper: SPL_NOOP_PROGRAM_ID,
            compression_program: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            bubblegum_program: MPL_BUBBLEGUM_PROGRAM_ID,
            mpl_program: MPL_TOKEN_METADATA_PROGRAM_ID,
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