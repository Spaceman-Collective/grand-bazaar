// import { web3, Program, BN } from "@coral-xyz/anchor";
// import { GrandBazaar } from "../target/types/grand_bazaar";
// import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

// import { PublicKey } from "@solana/web3.js";

// import { generateSigner } from '@metaplex-foundation/umi'
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
// import { createTree } from '@metaplex-foundation/mpl-bubblegum'

// import {MPL_BUBBLEGUM_PROGRAM_ID, TokenProgramVersion} from "@metaplex-foundation/mpl-bubblegum";
// import { SPL_ACCOUNT_COMPRESSION_PROGRAM_ID, SPL_NOOP_PROGRAM_ID, ValidDepthSizePair, getConcurrentMerkleTreeAccountSize } from "@solana/spl-account-compression";

// interface MintItemAccountTypes {
//     connection: web3.Connection,
//     SIGNER: web3.Keypair,
//     program: Program<GrandBazaar>,
//     MPLProgram: web3.PublicKey,
//     itemCollectionMint: web3.PublicKey,
//     itemCollectionMetadata: web3.PublicKey,
//     itemCollectionEdition: web3.PublicKey,
//     gameIdBuffer: Uint8Array,
//     gameId: bigint
//   }

//   const mintItemAccount = async (
//     { connection, SIGNER, program, MPLProgram, itemCollectionMint, itemCollectionMetadata, itemCollectionEdition, gameIdBuffer, gameId } : MintItemAccountTypes) => {
    
//     const umi = createUmi(connection);
//     //create merkle tree
//     const merkleTree = generateSigner(umi);
//     const builder = await createTree(umi, { 
//         merkleTree,
//         maxDepth: 14, //this tree would allow us around 10k item accounts to be minted
//         maxBufferSize: 64,
//     });
//     await builder.sendAndConfirm(umi);

//     console.log("Merkle Tree:", merkleTree.publicKey);

//     const [treeAuthority, _bump] = PublicKey.findProgramAddressSync(
//         [new PublicKey(merkleTree.publicKey).toBuffer()],
//         new PublicKey("BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"),
//     );
    
//     const gamePdaAddress = web3.PublicKey.findProgramAddressSync(
//         [Buffer.from("game"), gameIdBuffer],
//         program.programId
//     )[0];

//     // Item data
//     const accountData = {
//         ItemCollection: "itemCollectionMint",
//         Amount: "1",
//     };
//     const dataStr = JSON.stringify(accountData);
//     const init_data = new TextEncoder().encode(dataStr);

//     // has to be smaller than 200 bytes
//     if (init_data.length > 199) {
//         throw new Error("init_data exceeds the maximum allowed length.");
//     }

//     const ix = await program.methods.mintItemAccount(gameId, init_data).accounts({
//         signer: SIGNER.publicKey,
//         systemProgram: web3.SystemProgram.programId,
//         game: gamePdaAddress,
//         itemCollectionMint: itemCollectionMint,
//         itemCollectionMetadata: itemCollectionMetadata,
//         itemCollectionEdition: itemCollectionEdition,
//         tree_authority: treeAuthority,
//         newLeafOwner: SIGNER.publicKey,
//         merkle_tree: new PublicKey(merkleTree.publicKey),
//         log_wrapper: SPL_NOOP_PROGRAM_ID,
//         compression_program: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
//         bubblegum_program: MPL_BUBBLEGUM_PROGRAM_ID,
//         mpl_program: MPL_TOKEN_METADATA_PROGRAM_ID,
//     }).instruction();

//     const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

//     const msg = new web3.TransactionMessage({
//         payerKey: SIGNER.publicKey,
//         recentBlockhash: blockhash,
//         instructions: [ix],
//     }).compileToV0Message();

//     const tx = new web3.VersionedTransaction(msg);
//     tx.sign([SIGNER]);
//     console.log(Buffer.from(tx.serialize()).toString("base64"));
//     console.log(await connection.simulateTransaction(tx));
//     const txSig = await connection.sendTransaction(tx);
//     console.log("TX SIG: ", txSig);
// };

// export default mintItemAccount;