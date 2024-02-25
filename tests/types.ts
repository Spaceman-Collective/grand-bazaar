import { BN, web3 } from "@coral-xyz/anchor"
import { Account } from "@solana/spl-token"

export type InitializedGameType = {
  gamePdaAddress: web3.PublicKey,
  gameMintKey: web3.PublicKey,
  gameATA: web3.PublicKey
}

export type MintedCollection = {
  mintKey: web3.PublicKey,
  metadataAccount: web3.PublicKey,
  masterEditionAccount: web3.PublicKey,
  itemId: bigint
}

export type MintedItemAccount = {
  merkleTree: any,
  leafIndex: BN
}