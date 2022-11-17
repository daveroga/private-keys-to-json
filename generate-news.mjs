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

rl.question(`Please be sure to have the 'passwords' file with the passwords and select the keystores to generate':\n`, async (answer1) => {
  if (isNaN(answer1)) {
    rl.close();
    return console.log(chalk.red(`${answer1} is not a number. Please try again.`));
  }

  const numKeys = Number(answer1);

  const fileStream = fs.createReadStream('passwords');
  const rlf = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in private-keys as a single line break.

  const passwords = [];
  for await (const line of rlf) {
    passwords.push(line);
  }

  if (numKeys > passwords.length) {
    rl.close();
    return console.log(chalk.red(`Not enough passwords in 'passwords' file for the key generation. They should be at least ${numKeys}. Please try again.`));
  }
  const resultKeys = [];
  resultKeys.push('Private key | Address | Keystore | Password');

  for (let i = 0; i < numKeys; i++) {
    const wallet = Wallet['default'].generate();
    const address = wallet.getAddressString();
    const keystoreFilename = wallet.getV3Filename();
    const password = passwords[i];
    const keystring = await wallet.toV3String(password);
    console.log(`Generating keystore ${keystoreFilename} for address ${address} with password ${password}`);
    resultKeys.push(wallet.getPrivateKeyString().concat(' | ', address, ' | ', keystoreFilename, ' | ', password));
    fs.writeFile(keystoreFilename, keystring, function(err) {
      if(err) {
        return console.log(err);
      }
    }); 
  }

  fs.writeFile('result-keys', resultKeys.join('\n'), function(err) {
    if(err) {
      return console.log(err);
    }
  }); 

  console.log("\n");
  var ok = chalk.green(`JSON keystores generated.`);
  console.log(ok)
  rl.close();
});
