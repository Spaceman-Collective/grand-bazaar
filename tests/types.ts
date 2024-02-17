import { web3 } from "@coral-xyz/anchor"

export type InitializedGameType = {
  gamePdaAddress: any,
  gameMintKey: any,
  gameATA: any
}

export type MintedCollection = {
  mintKey: web3.PublicKey,
  metadataAccount: web3.PublicKey,
  masterEditionAccount: web3.PublicKey
}