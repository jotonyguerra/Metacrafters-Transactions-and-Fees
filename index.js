// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

//const newPair = Keypair.generate();
//console.log(newPair);

//Secret Key was changed to the newly generated wallet
const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        225, 158, 150, 140, 214, 188, 173, 206, 240,  93, 106,
      189, 169, 240,  50, 141, 101, 233, 227, 154, 203, 120,
      233,  29,   1,  11,  98,  53, 146,  50,  28, 172, 152,
       70, 160, 243,  11,  50,  66, 157,  95, 224,  89, 142,
       55,  60, 172, 195, 224, 158, 100, 177,  94, 188, 229,
      123, 234, 163,  12,  33, 197, 109, 255, 203
      ]            
);

const Public_KEY = new Uint8Array( [
    152,  70, 160, 243,  11,  50,  66, 157,
     95, 224,  89, 142,  55,  60, 172, 195,
    224, 158, 100, 177,  94, 188, 229, 123,
    234, 163,  12,  33, 197, 109, 255, 203
  ]
);
const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    const walletTotal = await getWalletBalance(Public_KEY) 
    console.log(`Sender Balance: ${parseInt(walletTotal) / LAMPORTS_PER_SOL} SOL`)
    const toBalance = await getWalletBalance(to.publicKey);
    console.log(`Receiver Wallet balance: ${parseInt(toBalance) / LAMPORTS_PER_SOL} SOL`);
    
    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: walletTotal / 2 //should send half the lamports in the wallet
        })
    );
    

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);
    const receiverBalance = await getWalletBalance(to.publicKey);
    console.log(`Receiver Wallet balance: ${parseInt(receiverBalance) / LAMPORTS_PER_SOL} SOL`);
    return 
}

const getWalletBalance = async (walletAddress) => {
    let returnBalance;
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        // console.log("Connection object is:", connection);

        // Make a wallet (keypair) from privateKey and get its balance
        //const myWallet = await Keypair.fromSecretKey(privateKey);
        const walletBalance = await connection.getBalance(
            new PublicKey(walletAddress)
        );
        returnBalance = walletBalance;
        //console.log(`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
    } catch (err) {
        console.log(err);
    }

    return returnBalance
}

const mainFunction = async () => {

    
    
    //await getWalletBalance(Public_KEY);
    await transferSol();
    //await getWalletBalance(Public_KEY);
}

mainFunction();
