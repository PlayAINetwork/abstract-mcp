# Abstract Chain MCP Server
A Model Context Protocol (MCP) server that enables AI agents to interact with the Abstract Chain blockchain.


## Installation
Configure your `.mcp.json` file in your home directory:
   ```json
   {
     "mcpServers": {
       "abstract-mcp": {
         "command": "node",
         "args": ["path/to/your/index.js"]
       }
     }
   }
   ```

## Available Tools
The Abstract Chain MCP server provides the following tools:

### 1. getWalletBalance
Retrieves native token and ERC20 token balances for a specified wallet address.

**Parameters:**
- `address` (string, required): Wallet address to check balances for
- `tokenAddresses` (array of strings, optional): List of token addresses to check balances for
- `includeZeroBalances` (boolean, optional, default: false): Whether to include tokens with zero balance

**Example prompt:**
```
Check the wallet balance for address 0x1234...5678 on Abstract Chain
```

**Response:**
![image](https://github.com/user-attachments/assets/c5c6a830-4b7d-4315-a9da-d6c0f99d5569)


### 2. getTokenSupply
Retrieves the total supply information for an ERC20 token on Abstract Chain.

**Parameters:**
- `tokenAddress` (string, required): ERC20 token contract address

**Example prompt:**
```
What is the total supply of the token at address 0xabcd...1234 on Abstract Chain?
```

**Response:**
![Screenshot 2025-05-01 152604](https://github.com/user-attachments/assets/e3baa25c-87f4-436a-adc8-bd2c4cf3c80c)


### 3. getTokenInfo
Gets detailed information about an ERC20 token on Abstract Chain.

**Parameters:**
- `tokenAddress` (string, required): ERC20 token contract address on Abstract Chain

**Example prompt:**
```
Show me information about the token at address 0xabcd...1234 on Abstract Chain
```

**Response:**
![Screenshot 2025-05-01 152436](https://github.com/user-attachments/assets/1883722e-d50f-410b-b262-016d39bc5958)


### 4. getTransactionData
Retrieves transaction information and receipt data for a specific transaction hash.

**Parameters:**
- `txHash` (string, required): Transaction hash to check

**Example prompt:**
```
Get the transaction details for hash 0x123...456 on Abstract Chain
```

**Response:**
![Screenshot 2025-05-01 152129](https://github.com/user-attachments/assets/41a191e3-6e82-411f-87c6-42b86a35a863)


### 5. getBlockInfo
Retrieves information about a specific block on Abstract Chain.

**Parameters:**
- `blockHash` (string, required): Block hash

**Example prompt:**
```
Show me information about block with hash 0x123...456 on Abstract Chain
```

**Response:**
![Screenshot 2025-05-01 151955](https://github.com/user-attachments/assets/ecb2832f-2bc5-4ade-aa29-67e53707cd4e)

