/* 
⭐⭐⭐
HERE WE ARE 
TAKING USER INPUT FOR THE 
BINARY KEY AND PLAIN TEXT
⭐⭐⭐
*/
const readline = require('readline');

function isValidBinaryKey(input) {
  if (input.length !== 64) {
      console.log("Input must be 64 bits long.");
      return false;
  }
  if (!/^[01]+$/.test(input)) {
      console.log("Input must be a binary number.");
      return false;
  }
  return true;
}

function getBinaryKey() {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });

  return new Promise((resolve) => {
      rl.question("Please enter a 64-bit binary key: ", (input) => {
          if (isValidBinaryKey(input)) {
              rl.close();
              resolve(input);  // resolve the promise with the valid input
          } else {
              console.log("Invalid input. Please try again.");
              rl.close();
              resolve(getBinaryKey());  // resolve with another promise for recursion
          }
      });
  });
}


function getPlaintext() {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });

  return new Promise((resolve) => {
      rl.question("Please enter the plaintext: ", (input) => {
          // Add any additional checks for the input here, if needed
          rl.close();
          resolve(input);
      });
  });
}

/* 
⭐⭐⭐
AT THIS STEP WE ARE DOING NECESSARY 
BINARY-TEXT CONVERSIONS
FOR ENCRYPTION TO WORK
⭐⭐⭐
*/

function TextToBinary(text) {
  let binary = '';
  for (let i = 0; i < text.length; i++) {
    binary += text[i].charCodeAt(0).toString(2).padStart(8, '0');
  }

  return binary;
}


function BinaryToText(binary) {
  // Insert a space every 8 characters (1 byte)
  const binaryWithSpaces = binary.replace(/(\d{8})/g, '$1 ');

  // Now split the string into an array with each 8-bit segment as an element
  const binaries = binaryWithSpaces.trim().split(' ');

  let text = '';
  for (let i = 0; i < binaries.length; i++) {
    text += String.fromCharCode(parseInt(binaries[i], 2));
  }

  return text;
}


/* 
⭐⭐⭐
INITIAL PERMUTATION (IP) STEP IS INCLUDED
TO REARRANGE THE BITS OF THE INPUT PLAINTEXT OR 
THE DECRYPTED CIPHERTEXT BEFORE PROCESSING FURTHER.
⭐⭐⭐
*/

function InitialPermuation(input) {
  const initialPermutation = [
    58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46,
    38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9,
    1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47,
    39, 31, 23, 15, 7,
  ];

  let output = '';
  for (let i = 0; i < initialPermutation.length; i++) {
    let index = initialPermutation[i] - 1;
    output += input[index];
  }

  return output;
}

/* 
⭐⭐⭐
THE FINAL PERMUTATION SERVES TO REVERSE 
THE INITIAL PERMUTATION AND BRING THE
BITS BACK TO THEIR ORIGINAL ORDER. 
⭐⭐⭐
*/

function FinalPermuation(input) {
  const finalPermutation = [
    40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14,
    54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60,
    28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41,
    9, 49, 17, 57, 25,
  ]; //THIS MATRIX IS THE INVERSE OF THE INITIAL PERMUATION MATRIX

  let output = '';
  for (let i = 0; i < finalPermutation.length; i++) {
    let index = finalPermutation[i] - 1;
    output += input[index];
  }

  return output;
}



function Generate_64bit_Key() {
  let key = '';

  for (let i = 0; i < 64; i++) {
    key += Math.floor(Math.random() * 2).toString();
    //generates a random number from [0,1), and when multipled by 2 and floored, we get a value of 0 or 1
  }

  return key;
}


/* 
⭐⭐⭐
REMOVE PARITY BITS TO GET 56-bit KEY
⭐⭐⭐
*/

function Remove_Parity_Bits(key) {
  let key_56Bit = '';

  for (let i = 0; i < 64; i++) {
    if ((i + 1) % 8 !== 0) {
      key_56Bit += key[i]; //we shall remvoe every 8th partiy bit, to get a result of 56 bit from 64 bit key
    }
  }
  return key_56Bit;
}

function LeftCircularShift(key, positions) {
  let firstPart = key.substr(positions); // Gets the substring from 'positions' to end.
  let secondPart = key.substr(0, positions); // Gets the first 'positions' bits.
  let circularShiftedKey = firstPart.concat(secondPart); // Concatenates the two parts.
  return circularShiftedKey;
}

/*
⭐⭐⭐
WE ARE CONVERTING 48 BIT CHUNK BACK INTO 
32 BIT CHUNK so IT CAN BE XOR with LEFT 32 BITS
⭐⭐⭐
*/

function Compression_PBox(key) {
  const PC2 = [
    14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27,
    20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56,
    34, 53, 46, 42, 50, 36, 29, 32,
  ];

  let key_48bits = '';

  for (let i = 0; i < PC2.length; i++) {
    let index = PC2[i] - 1;
    key_48bits += key[index];
  }

  return key_48bits;
}


/*
⭐⭐⭐
SUBKEYS GENERATED FOR EACH ROUND
⭐⭐⭐
*/

function Generate_Subkey(key) {
  let subRoundKeys = [];

  let left_bits = key.substr(0, Math.floor(key.length / 2));
  let right_bits = key.substr(Math.floor(key.length / 2), key.length);

  for (let round_number = 1; round_number < 17; round_number++) {
    if (
      round_number === 1 ||
      round_number === 2 ||
      round_number === 9 ||
      round_number === 16
    ) {
      left_bits = LeftCircularShift(left_bits, 1);
      right_bits = LeftCircularShift(right_bits, 1);
    } else {
      left_bits = LeftCircularShift(left_bits, 2);
      right_bits = LeftCircularShift(right_bits, 2);
    }

    let concated_bits = left_bits.concat(right_bits);
    let current_round_subKey = Compression_PBox(concated_bits);
    subRoundKeys.push(current_round_subKey);
  }

  return subRoundKeys;
}


/*
⭐⭐⭐
ADD PADDING SO WE GET EQUAL 64 BIT CHUNKS
⭐⭐⭐
*/

function AddPadding(binaryText) {
  // Determine how much padding is needed to make the binaryText
  // a multiple of 64 bits in length.
  let paddingSize = 64 - (binaryText.length % 64);

  // If the binaryText is already a multiple of 64 bits, 
  // no additional padding is needed.
  if (paddingSize === 64) {
    return binaryText;
  }

  // Convert the paddingSize to an 8-bit binary string,
  // to indicate how much padding has been added in the last byte.
  let paddingBinaryStr = paddingSize.toString(2).padStart(8, '0');

  // Add '0' bits as padding to the binaryText, excluding the last 8 bits 
  // which will be used to store the paddingSize.
  let paddedText = binaryText.padEnd(binaryText.length + paddingSize - 8, '0');
  
  // Return the padded text with the padding size appended to the end.
  return paddedText + paddingBinaryStr;
}

function RemovePadding(paddedBinaryText) {
  // Retrieve the last 8 bits of the padded binary string,
  // which indicates the size of the padding.
  let lastByte = paddedBinaryText.slice(-8);

  // Convert the last 8 bits to decimal to determine the size of the padding.
  let paddingSize = parseInt(lastByte, 2);

  // Remove the padding bits and the last byte (which indicates padding size)
  // to retrieve the original binaryText.
  let unpaddedText = paddedBinaryText.slice(0, -paddingSize);
  
  return unpaddedText;
}


function Break_Text_64Bit_Chunks(binary_text) {
    let chunks = [];
  
    let numberOfChunks = binary_text.length / 64;
  
    // Break the text into 64-bit chunks and add them to the chunks array.
    for (let i = 0; i < numberOfChunks; i++) {
      chunks.push(binary_text.substr(i * 64, 64));
    }
  
    return chunks;
  }

/*
⭐⭐⭐
WE ARE GENERATING 32 BITS TO 
48 BITS SO WE CAN XOR WITH SUBKEY
⭐⭐⭐
*/

function EXPANTION_PERMUTATION(right_bits) {
  const EXPANSION_TABLE = [
    32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15,
    16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28,
    29, 28, 29, 30, 31, 32, 1,
  ];

  let expanded_bits = '';

  for (let i = 0; i < EXPANSION_TABLE.length; i++) {
    let index = EXPANSION_TABLE[i] - 1;
    expanded_bits += right_bits[index];
  }

  return expanded_bits;
}

function XOR(input1, input2) {
  let result = '';
  for (let i = 0; i < input1.length; i++) {
    result += input1[i] === input2[i] ? '0' : '1';
  }
  return result;
}




function SUBSTITION_SBOX(input) {
  let output = '';

  const S = [
    [
      [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
      [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
      [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
      [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
    ],
    [
      [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
      [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
      [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
      [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
    ],
    [
      [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
      [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
      [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
      [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
    ],
    [
      [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
      [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
      [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
      [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
    ],
    [
      [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
      [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
      [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
      [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
    ],
    [
      [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
      [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
      [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
      [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
    ],
    [
      [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
      [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
      [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
      [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
    ],
    [
      [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
      [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
      [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
      [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
    ],
  ];

  let numberOfChunks = 8;

  // Break the input into 8 of  6-bit chunks and add them to the chunks array.
  for (let i = 0; i < numberOfChunks; i++) {
    let chunk_6bit = input.substr(i * 6, 6);
    let row = parseInt(chunk_6bit[0] + chunk_6bit[5], 2);
    let col = parseInt(chunk_6bit.substr(1, 4), 2);

    output += S[i][row][col].toString(2).padStart(4, '0');
  }
  return output;
}

function PERMUTATION_PBOX(input) {
  let prm_bits = '';

  const PERMUTATION_BOX = [
    16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14,
    32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
  ];

  for (let i = 0; i < PERMUTATION_BOX.length; i++) {
    let index = PERMUTATION_BOX[i] - 1;
    prm_bits += input[index];
  }

  return prm_bits;
}

function FiestalFunction(right_bits, roundKey) {
  let expanded_bits = EXPANTION_PERMUTATION(right_bits);
  let xorOutput = XOR(expanded_bits, roundKey);
  let SBOX_output = SUBSTITION_SBOX(xorOutput);
  let PBOX_output = PERMUTATION_PBOX(SBOX_output);
  return PBOX_output;
}

function DES_Round(binaryText, roundKey) {
  let left_bits = binaryText.substr(0, Math.floor(binaryText.length / 2));
  let right_bits = binaryText.substr(
    Math.floor(binaryText.length / 2),
    binaryText.length
  );
  let fiestal_function_output = FiestalFunction(right_bits, roundKey);

  let finalXor = XOR(fiestal_function_output, left_bits);

  let output = right_bits + finalXor; //this is where we are doing the Fiestal SWAP of the righr and left!
  
  return output;
}

function DES_Encryption(SUB_ROUND_KEYS, input) {
  let binary_text = TextToBinary(input);
  let paddedBinary = AddPadding(binary_text);
  console.log('Padded Binary Input: ' + paddedBinary);

  let chunks_64bits = Break_Text_64Bit_Chunks(paddedBinary);
  console.log('64 Bit Chunks of your Input: ' + chunks_64bits);
  
  let EcryptedText = '';

  for (const chunk of chunks_64bits) {
    let input = InitialPermuation(chunk);

    for (let round = 0; round < 16; round++) {
      input = DES_Round(input, SUB_ROUND_KEYS[round]);
    }

    let left_bits = input.substr(0, Math.floor(input.length / 2));
    let right_bits = input.substr(Math.floor(input.length / 2), input.length);
    let swapped = right_bits + left_bits;

    let finalCipherBlock = FinalPermuation(swapped);

    EcryptedText += finalCipherBlock;
  }

  return EcryptedText;
}

function DES_Decryption(SUB_ROUND_KEYS, input) {
  let chunks_64bits = Break_Text_64Bit_Chunks(input);

  let DecryptedBinary = '';

  for (const chunk of chunks_64bits) {
    let input = InitialPermuation(chunk);

    for (let round = 15; round >= 0; round--) {
      input = DES_Round(input, SUB_ROUND_KEYS[round]);
    }

    let left_bits = input.substr(0, Math.floor(input.length / 2));
    let right_bits = input.substr(Math.floor(input.length / 2), input.length);
    let swapped = right_bits + left_bits;

    let finalCipherBlock = FinalPermuation(swapped);

    DecryptedBinary += finalCipherBlock;
  }

  DecryptedBinary = RemovePadding(DecryptedBinary);
  return BinaryToText(DecryptedBinary);
}



// // let key = Generate_64bit_Key(); --> uncommet this if you want to auto-generate the key
// let key;
// do {
//     key = prompt("Please enter a 64-bit binary key:");
// } while (!isValidBinaryKey(key));


// let key_56bit = Remove_Parity_Bits(key); // Reduce key to 56 bits
// let subKeys = Generate_Subkey(key_56bit); // Generate 16 48-bit subkeys for 16 rounds

// // let plaintext = 'Hello, DES!'; // The message to be encrypted
// let plaintext = prompt("Please enter plain text");
// let ciphertext = DES_Encryption(subKeys, plaintext); // Encrypt the message

// console.log('Plaintext: ' + plaintext); // Log the original message
// console.log('Ciphertext (Binary): ' + ciphertext); // Log the encrypted message in binary form

// let decryptedtext = DES_Decryption(subKeys, ciphertext); // Decrypt the message
// console.log('Decrypted Text: ' + decryptedtext); // Log the decrypted message




async function MAIN_FUNCTION() {
  let key = await getBinaryKey();
  let plainText = await getPlaintext();
  let key_56bit = Remove_Parity_Bits(key); 
  let subKeys = Generate_Subkey(key_56bit);

  console.log("SUBKEYS: ",subKeys);

  let ciphertext = DES_Encryption(subKeys, plainText);
  console.log('Ciphertext (Binary): ' + ciphertext);

  let decryptedtext = DES_Decryption(subKeys, ciphertext);
  console.log('Decrypted Text: ' + decryptedtext);
}

MAIN_FUNCTION();