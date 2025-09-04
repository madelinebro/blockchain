// blockchain.js
// Mini blockchain with Proof-of-Work and validation.
// Run: node blockchain.js

const crypto = require('crypto');

/** A single block in the chain */
class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0; // used for mining
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        String(this.index) +
        this.timestamp +
        JSON.stringify(this.data) +
        this.previousHash +
        String(this.nonce)
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`   Block mined (idx=${this.index}): ${this.hash}`);
  }
}

class Blockchain {
  constructor(difficulty = 3) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
  }

  createGenesisBlock() {
    return new Block(0, Date.now().toString(), 'Genesis Block', '0');
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

function main() {
  const demoCoin = new Blockchain(3);

  console.log('     Mining block #1 ...');
  demoCoin.addBlock(new Block(1, Date.now().toString(), { from: 'Alice', to: 'Bob', amount: 50 }));

  console.log('     Mining block #2 ...');
  demoCoin.addBlock(new Block(2, Date.now().toString(), { from: 'Charlie', to: 'Dana', amount: 75 }));

  console.log('     Mining block #3 ...');
  demoCoin.addBlock(new Block(3, Date.now().toString(), [
    { from: 'Eve', to: 'Frank', amount: 20 },
    { from: 'Gina', to: 'Hank', amount: 10 },
  ]));

  console.log('\n   Full chain:');
  console.log(JSON.stringify(demoCoin, null, 2));

  console.log('\n    Is chain valid?', demoCoin.isChainValid());

  console.log('\n     Tampering with block #1 data ...');
  demoCoin.chain[1].data.amount = 9999;
  console.log('    Is chain valid after tamper?', demoCoin.isChainValid());
}

main();
