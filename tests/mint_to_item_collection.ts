import { web3, Program, BN } from "@coral-xyz/anchor";
import { GrandBazaar } from "../target/types/grand_bazaar";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

import { PublicKey } from "@solana/web3.js";

import { createSignerFromKeypair, generateSigner, keypairIdentity, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createTree, mplBubblegum } from '@metaplex-foundation/mpl-bubblegum'

import { MPL_BUBBLEGUM_PROGRAM_ID, TokenProgramVersion, getAssetWithProof, findLeafAssetIdPda } from "@metaplex-foundation/mpl-bubblegum";
import { SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, SPL_NOOP_PROGRAM_ID } from "@solana/spl-account-compression";
import { MintedCollection, MintedItemAccount } from "./types";
import { readFileSync } from "fs";
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';
import { rpc } from "@coral-xyz/anchor/dist/cjs/utils";

interface MintToItemCollectionTypes {
    connection: web3.Connection,
    SIGNER: web3.Keypair,
    program: Program<GrandBazaar>,
    gameIdBuffer: Uint8Array,
    gameId: bigint,
    collection: MintedCollection,
    itemAccount: MintedItemAccount,
    // merkleTree: web3.Keypair,
    amount: bigint,
}

const mintToItemCollection = async (
    { connection, SIGNER, program, collection, gameIdBuffer, gameId, amount, itemAccount }: MintToItemCollectionTypes) => {

    const umi = createUmi(connection).use(mplBubblegum());
    // const mySecretKey = Uint8Array.from(JSON.parse(readFileSync('./keypairs/testing_pair.json').toString()));
    // const myKeypair = umi.eddsa.createKeypairFromSecretKey(mySecretKey);
    // const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
    // umi.use(keypairIdentity(myKeypairSigner));
    umi.use(dasApi());

    const merkleTree = itemAccount.merkleTree
    const leafIndex = itemAccount.leafIndex

    const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
        [new PublicKey(merkleTree.publicKey).toBuffer()],
        new PublicKey("BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"),
    );

    const gamePdaAddress = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("game"), gameIdBuffer],
        program.programId
    )[0];

    const gameMintKey = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), gameIdBuffer],
        program.programId
    )[0];

    const [assetId, bump] = await findLeafAssetIdPda(umi, {
        merkleTree: publicKey(merkleTree.publicKey),
        leafIndex: BigInt(leafIndex.toString()),
    })

    // const collectionAssetsList  = await umi.rpc.getAssetsByGroup({
    //     groupKey: 'collection',
    //     groupValue: collection.mintKey.toString(),
    // })

    // const ownerAssetsList = await umi.rpc.getAssetsByOwner({ owner: publicKey(SIGNER.publicKey) });

    // const assetsInCollectionOwnedByOwner = ownerAssetsList.items.filter(asset =>
    //     collectionAssetsList.items.some(collectionAsset => collectionAsset.id === asset.id)
    // );

    // const assetId = assetsInCollectionOwnedByOwner[0].id



    const assetWithProof = await getAssetWithProof(umi, publicKey(assetId))
    const index = assetWithProof.index
    const root = assetWithProof.root
    const nonce = new BN(assetWithProof.nonce)
    const leaf = new PublicKey(assetWithProof.rpcAsset.compression.asset_hash).toBytes();


    const merkleInfo = {
        merkleTree: new PublicKey(merkleTree.publicKey),
        root: [...root],
        leaf: [...leaf],
        nonce: nonce,
        index: index,
        proofIndexStart: 0,
        proofIndexEnd: 1,
    }

    const itemMetadata = {
        itemId: new BN(collection.itemId.toString()),
        name: "sword",
        symbol: "swd",
        uri: "123"
      };
    
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

    const ix = await program.methods.mintToItemAccount(itemMetadata,
        merkleInfo,
        new BN(gameId.toString()),
        new BN(amount.toString()),
        ).accounts({
        signer: SIGNER.publicKey,
        systemProgram: web3.SystemProgram.programId,
        game: gamePdaAddress,
        merkleTree: new PublicKey(merkleTree.publicKey),
        logWrapper: SPL_NOOP_PROGRAM_ID,
        splCompression: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        bubblegumProgram: MPL_BUBBLEGUM_PROGRAM_ID,
        treeAuthority: treeAuthority,
        gameCollectionMint:gameMintKey,
        itemCollectionMetadata: collection.metadataAccount,
        accountOwner: SIGNER.publicKey,
        mplMetadata: MPL_TOKEN_METADATA_PROGRAM_ID,
        itemCollectionMint: collection.mintKey,
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
    // console.log("TX SIG: ", txSig);
};

export default mintToItemCollection;