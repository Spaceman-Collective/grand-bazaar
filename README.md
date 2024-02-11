# Grand Bazaar

Grand Bazaar is a v1 implementation of a compressed tradables CLOB using Phoenix. This program allows a game creator to create and mint compressed tradables, create markets on Phoenix and then users to create orders for buying and selling of those tradables. 

## Compressed Tradables
Compressed Tradables are compressed NFTs where the URI field has been repurposed to serve as an amount field. This effectively turns the cNFT into a Compressed Token Account, where the item it represents is the collection it's minted to. We use amount in the URI field, but using our flatbuffers approach, any one could expand on this approach by using different schemas to slot into the URI field. 

### User Stories
1. As a game admin, I want to create a new game id signer which is used to mint new items and item accounts. 
2. As a game admin I want to mint new a new item as a Collection NFT.
3. As an admin I’d like to mint an Item Account (Compressed) to the Item Collection and give it to a wallet
    - Set the inital amount
4. As an admin I’d like to mint to existing an Item Account
5. As a user I’d like to transfer from an Item Account I own to another user’s Item Account they own
7. As a user I’d like to burn tokens from an Item Account
8. As a user I’d like to decompress into an ATA 
9. An exchange to could transfer from user ATA to their ATA and then decompress
    - Potentially allow for Transfer&Decompress function that doesn’t require a second Compressed Obj for the receiver?
10. As a user I’d like to compress an ATA into an Item Account


## Bazaar
The Bazaar lets you take the tradables and buy/sell them using Phoenix CLOB. 

### User Stories
1. As a game admin I'd like to make a new market for an item collection
2. As a user I'd like to make a buy order on the market
3. As a user I'd like to make a sell order on the market
4. As a user I'd like to cancel a partially filled order and withdraw