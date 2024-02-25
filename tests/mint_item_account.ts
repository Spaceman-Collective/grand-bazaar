import { web3, Program, BN } from "@coral-xyz/anchor";
import { GrandBazaar } from "../target/types/grand_bazaar";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import { PublicKey, TransactionResponse, VersionedTransactionResponse } from "@solana/web3.js";

import { createSignerFromKeypair, generateSigner, keypairIdentity } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createTree, mplBubblegum } from '@metaplex-foundation/mpl-bubblegum'
import * as bs58 from 'bs58';


import { MPL_BUBBLEGUM_PROGRAM_ID, TokenProgramVersion } from "@metaplex-foundation/mpl-bubblegum";
import { SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, SPL_NOOP_PROGRAM_ID,  ChangeLogEventV1, deserializeChangeLogEventV1} from "@solana/spl-account-compression";
import { MintedCollection } from "./types";
import { readFileSync } from "fs";

interface MintItemAccountTypes {
    connection: web3.Connection,
    SIGNER: web3.Keypair,
    program: Program<GrandBazaar>,
    gameIdBuffer: Uint8Array,
    gameId: bigint,
    collection: MintedCollection
}

function getAllChangeLogEventV1FromTransaction(
    txResponse: TransactionResponse | VersionedTransactionResponse,
    noopProgramId: PublicKey = SPL_NOOP_PROGRAM_ID
  ): ChangeLogEventV1[] {
    if (!txResponse) throw Error(`No txResponse provided. Response was: ${JSON.stringify(txResponse)}`);

    const accountKeys = txResponse.transaction.message
      .getAccountKeys()
      .keySegments()
      .flat();
  
    let changeLogEvents: ChangeLogEventV1[] = [];
  
    txResponse!.meta?.innerInstructions?.forEach((compiledIx) => {
      compiledIx.instructions.forEach((innerIx) => {
        if (
          noopProgramId.toBase58() !==
          accountKeys[innerIx.programIdIndex].toBase58()
        )
          return;
  
        try {
          changeLogEvents.push(
            deserializeChangeLogEventV1(Buffer.from(bs58.decode(innerIx.data)))
          );
        } catch (__) {
        }
      });
    });
  
    return changeLogEvents;
}

const mintItemAccount = async (
    { connection, SIGNER, program, collection, gameIdBuffer, gameId }: MintItemAccountTypes) => {

    const umi = createUmi(connection).use(mplBubblegum());
    const mySecretKey = Uint8Array.from(JSON.parse(readFileSync('./keypairs/testing_pair.json').toString()));
    const myKeypair = umi.eddsa.createKeypairFromSecretKey(mySecretKey);
    const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
    umi.use(keypairIdentity(myKeypairSigner));

    //create merkle tree
    const merkleTree = generateSigner(umi);
    const builder = await createTree(umi, {
        merkleTree,
        maxDepth: 14, //this tree would allow us around 10k item accounts to be minted
        maxBufferSize: 64,
    });
    await builder.sendAndConfirm(umi);

    // console.log("Merkle Tree:", merkleTree.publicKey);

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
        ItemCollection: "itemCollectionMint",
        Amount: "1",
    };
    const dataStr = JSON.stringify(accountData);
    const init_data = new TextEncoder().encode(dataStr);

    // has to be smaller than 200 bytes
    if (init_data.length > 199) {
        throw new Error("init_data exceeds the maximum allowed length.");
    }

    const ix = await program.methods.mintItemAccount(new BN(gameId.toString()), Buffer.from(init_data)).accounts({
        signer: SIGNER.publicKey,
        systemProgram: web3.SystemProgram.programId,
        game: gamePdaAddress,
        itemCollectionMint: collection.mintKey,
        itemCollectionMetadata: collection.metadataAccount,
        itemCollectionEdition: collection.masterEditionAccount,
        treeAuthority: treeAuthority,
        newLeafOwner: SIGNER.publicKey,
        merkleTree: new PublicKey(merkleTree.publicKey),
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        bubblegumProgram: MPL_BUBBLEGUM_PROGRAM_ID,
        mplProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        bubblegumSigner: new PublicKey("4ewWZC5gT6TGpm5LZNDs9wVonfUT2q5PP5sc9kVbwMAK")
    }).instruction();

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const msg = new web3.TransactionMessage({
        payerKey: SIGNER.publicKey,
        recentBlockhash: blockhash,
        instructions: [ix],
    }).compileToV0Message();

    const tx = new web3.VersionedTransaction(msg);
    tx.sign([SIGNER]);
    // console.log(Buffer.from(tx.serialize()).toString("base64"));
    // console.log("META ACCOUNT: ", collection.metadataAccount.toString());
    // console.log(await connection.simulateTransaction(tx));
    const txSig = await connection.sendTransaction(tx);

    await connection.confirmTransaction(txSig, 'confirmed');

    const txResponse = await connection.getTransaction(txSig, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
    });

    const events = getAllChangeLogEventV1FromTransaction(txResponse);
    const leafIndex = new BN(events[0].index);

    return {
        merkleTree,
        leafIndex
    }
    // console.log("TX SIG: ", txSig);
};

export default mintItemAccount;