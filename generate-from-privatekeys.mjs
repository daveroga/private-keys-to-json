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
msg += "************************************ WARNING **************************************\n";
msg += "* This will create/replace keystores files in this folder from private-keys file. *\n";
msg += "* ------------------------ Press Ctrl + C to abort. ----------------------------- *\n";
msg += "***********************************************************************************\n";
console.log(chalk.yellow(msg));

rl.question(`Please be sure to have the 'private-keys' file with the keys and passwords separated by ';' -> <key>;<password> and press a key':\n`, async (answer1) => {
  const fileStream = fs.createReadStream('private-keys');
  const rlf = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in private-keys as a single line break.
  for await (const line of rlf) {
    const privateKey = line.split(';')[0];
    const password = line.split(';')[1];
    const privateKeyBuffer = EthUtil.toBuffer(privateKey);
    const wallet = Wallet['default'].fromPrivateKey(privateKeyBuffer);
    const address = wallet.getAddressString();
    const keystoreFilename = wallet.getV3Filename();
    const keystring = await wallet.toV3String(password);
    console.log(`Generating keystore ${keystoreFilename} for address ${address}`);
          
    fs.writeFile(keystoreFilename, keystring, function(err) {
      if(err) {
        return console.log(err);
      }
    }); 
  }

  console.log("\n");
  var ok = chalk.green(`JSON keystores generated.`);
  console.log(ok)
  rl.close();
});
