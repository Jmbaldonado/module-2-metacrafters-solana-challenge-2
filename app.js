const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const base58 = require("bs58");

async function makeConnection() {
  return new Connection(clusterApiUrl("devnet"), "confirmed");
}

async function connectToWallet(secretKey) {
  return Keypair.fromSecretKey(base58.decode(secretKey));
}

async function getWalletBalance(publicKey) {
  try {
    const connection = await makeConnection();
    const walletBalance = await connection.getBalance(new PublicKey(publicKey));

    return parseInt(walletBalance);
  } catch (err) {
    console.error("Error :" + err);
  }
}

async function transferSol(fromWallet, toWallet) {
  try {
    const connection = await makeConnection();
    const fromPublicKey = fromWallet._keypair.publicKey;
    const toPublicKey = toWallet._keypair.publicKey;

    let fromWalletBalance = await getWalletBalance(fromPublicKey);
    let toWalletBalance = await getWalletBalance(toPublicKey);

    console.log(
      `from Wallet Balance: ${fromWalletBalance / LAMPORTS_PER_SOL} SOL`
    );
    console.log(`to Wallet Balance: ${toWalletBalance / LAMPORTS_PER_SOL} SOL`);

    console.log(
      `Transferring 50% of wallet balance (${
        (fromWalletBalance * 0.5) / LAMPORTS_PER_SOL
      }) to another wallet`
    );
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: toWallet.publicKey,
        lamports: Math.round(fromWalletBalance * 0.5),
      })
    );

    // Sign transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      fromWallet,
    ]);

    console.log("Signature is", signature);

    fromWalletBalance = await getWalletBalance(fromPublicKey);
    toWalletBalance = await getWalletBalance(toPublicKey);
    console.log(
      `from Wallet Balance: ${fromWalletBalance / LAMPORTS_PER_SOL} SOL`
    );
    console.log(`to Wallet Balance: ${toWalletBalance / LAMPORTS_PER_SOL} SOL`);
  } catch (err) {
    console.error("Error :" + err);
  }
}

const main = async () => {
  const fromWalletKeyPair = await connectToWallet(
    "2Vzk5f3qFBS1gNQzLsxYudADB1kX2debRHeWjeoTLyBPVQTqaF8CvwTkjSLJYeq5SxAfeorX2MXgACPxuJry113A"
  );
  const toWalletKeyPair = await connectToWallet(
    "2JEqHhUr8vWaz26b6XRR5xZ9BMMUnSsNdQRCEmKeVNtTPL5JSx3rB9dCxmaGEGmegyxbHDjDwoPDQihZHEKcyqtW"
  );
  await transferSol(fromWalletKeyPair, toWalletKeyPair);
};

main()
  .then(() => {
    console.log("Program run successfully");
  })
  .catch((e) => {
    console.log(e);
  });
