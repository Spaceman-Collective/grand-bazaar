# Compressed Associated Tradables

We make use of the upgrade metadata instruction in the more recent bubblegum upgrade to actually use compressed objects as Associated Token Accounts (or anything else) by hijacking the URI field + Collection NFT. 

For the URI field in the Metadata args for the compression object, we can treat it as just 200 bytes Vec<u8>. Then throw a flatbuffers schema + compiled files into attributes for the Collection NFT. 

The key here is the update and mint authority for items must be a program, which increases CPI to 3, which means only one more program can compose on top of it. 

### Grand Bazaar - Minting Items

1. As an admin I’d like to create an Item Collection as a Collection NFT
    1. This links the schema to a Collection as a traditional T22 WEN NFT
2. As an admin I’d like to mint an Item Account to the Item Collection and give it to a wallet
3. As an admin I’d like to increment / decrement an Item Account issued by LIM
4. As a user I’d like to transfer from an Item Account I own to another user’s Item Account they own
5. As a user I’d like to burn tokens from an Item Account
6. As a user I’d like to decompress into an ATA 
    1. An exchange to could transfer from user ATA to their ATA and then decompress
        1. Potentially allow for Transfer&Decompress function that doesn’t require a second Compressed Obj for the receiver?
7. As a user I’d like to compress an ATA into an Item Account

### Grand Bazaar - Exchange