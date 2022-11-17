#!/usr/bin/env node

import Wallet from 'ethereumjs-wallet';
import EthUtil from 'ethereumjs-util';
import chalk from 'chalk';
import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


let msg = "";
msg += "**************************** WARNING *****************************\n";
msg += "* This will create/replace keystore file in this folder.         *\n";
msg += "* ------------------ Press Ctrl + C to abort. ------------------ *\n";
msg += "******************************************************************\n";
console.log(chalk.yellow(msg));

rl.question(`Please enter the plain private key including '0x':\n`, async (answer1) => {
  if (answer1 == "") {
    rl.close();
    return console.log(chalk.red("Private key is empty. Please try again."));
  }

  if (answer1.length != 66) {
    rl.close();
    return console.log(chalk.red("Private key length must be 66 characters."));
  }

  rl.question('\nPlease enter the passphrase:\n', async (answer2) => {
    const privateKeyBuffer = EthUtil.toBuffer(answer1);
    const wallet = Wallet['default'].fromPrivateKey(privateKeyBuffer);
    const publicKey = wallet.getPublicKeyString();
    console.log(`PUBLIC KEY: ${publicKey}`);
    const address = wallet.getAddressString();
    console.log(`ADDRESS: ${address}`);
    const keystoreFilename = wallet.getV3Filename();
    const keystring = await wallet.toV3String(answer2);
    console.log(keystring);
          
    fs.writeFile(keystoreFilename, keystring, function(err) {
      if(err) {
        return console.log(err);
      }
    }); 

    console.log("\n");
    var ok = chalk.green(`JSON keystore generated. See ${keystoreFilename} file.`);
    console.log(ok)
    rl.close();
  });
});
