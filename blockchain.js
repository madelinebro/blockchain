// Extended Mini Blockchain for Assignment 1

const crypto = require('crypto');

class Block {
/** 
   * @param {number} index
   * @param {string} timestamp
   * @param {Array} transactions - array of transaction objects
   * @param {string} previousHash
   */
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions; // now always an array
    this.previousHash = previousHash;
    this.nonce = 0; // used for mining
    this.hash = this.calculateHash();
  }

  /** Compute SHA-256 hash */
  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        String(this.index) +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        String(this.nonce)
      )
      .digest('hex');
  }

  /** Proof-of-Work mining */
  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`   Block mined (idx=${this.index}): ${this.hash} (nonce=${this.nonce})`);
  }
}

/** Blockchain container */
class Blockchain {
  constructor(difficulty = 3) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
  }

  createGenesisBlock() {
    return new Block(0, Date.now().toString(), [{ note: 'Genesis Block' }], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }
}

/* ---------------------- practice ---------------------- */
function main() {
  const demoCoin = new Blockchain(3); // difficulty=3

  // Add blocks with transactions
  console.log('     Mining block #1 ...');
  demoCoin.addBlock(new Block(1, Date.now().toString(), [
    { from: 'Madeline', to: 'Jaz', amount: 50 },
    { from: 'Bobbi', to: 'Cowboy', amount: 25 }
  ]));

  console.log('     Mining block #2 ...');
  demoCoin.addBlock(new Block(2, Date.now().toString(), [
    { from: 'Jenn', to: 'Sarina', amount: 75 }
  ]));

  console.log('     Mining block #3 ...');
  demoCoin.addBlock(new Block(3, Date.now().toString(), [
    { from: 'Ellen', to: 'Mimi', amount: 20 },
    { from: 'Lea', to: 'Jether', amount: 10 }
  ]));

  // Show chain
  console.log('\n   Full chain:');
  console.log(JSON.stringify(demoCoin, null, 2));

  // Validate chain
  console.log('\n    Is chain valid?', demoCoin.isChainValid());

  // Tamper test
  console.log('\n     Tampering with block #1 data ...');
  demoCoin.chain[1].transactions[0].amount = 9999;
  console.log('    Is chain valid after tamper?', demoCoin.isChainValid());
}

main();
