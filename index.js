const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { ethers } = require("ethers");

const ERC20ABI = [
    "function symbol() external view returns (string)",
    "function name() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];

const ABSTRACT_CONFIG = {
    rpcUrl: "https://api.mainnet.abs.xyz",
    name: "Abstract Chain",
    chainId: 2741,
    nativeToken: {
        symbol: "ETH",
        name: "Ether",
        decimals: 18
    }
};

// Initialize MCP server
const server = new McpServer({
    name: "Abstract Chain MCP",
    version: "1.0.0",
    description: "An MCP server for AI agents to interact with Abstract Chain"
});

function getProvider() {
    try {
        return new ethers.providers.JsonRpcProvider(ABSTRACT_CONFIG.rpcUrl);
    } catch (error) {
        throw new Error(`Failed to connect to Abstract Chain RPC: ${error.message}`);
    }
}

function formatBalance(balance, decimals) {
    return ethers.utils.formatUnits(balance, decimals);
}

// Tool: Get wallet balance with token discovery
server.tool(
    "getWalletBalance",
    "Get balance of native token and specified token addresses for a wallet",
    {
        address: z.string().describe("Wallet address to check balances for"),
        tokenAddresses: z.array(z.string()).optional().describe("Optional list of token addresses to check balances for"),
        includeZeroBalances: z.boolean().default(false).describe("Whether to include tokens with zero balance")
    },
    async ({ address, tokenAddresses = [], includeZeroBalances }) => {
        try {
            const provider = getProvider();

            const nativeBalance = await provider.getBalance(address);
            const formattedNativeBalance = formatBalance(nativeBalance, ABSTRACT_CONFIG.nativeToken.decimals);

            let tokens = [];
            
            if (tokenAddresses && tokenAddresses.length > 0) {
                const tokenPromises = tokenAddresses.map(async (tokenAddr) => {
                    try {
                        const tokenContract = new ethers.Contract(tokenAddr, ERC20ABI, provider);

                        const [symbol, name, decimals, balance] = await Promise.all([
                            tokenContract.symbol(),
                            tokenContract.name(),
                            tokenContract.decimals(),
                            tokenContract.balanceOf(address)
                        ]);

                        if (!includeZeroBalances && balance.isZero()) {
                            return null;
                        }

                        return {
                            tokenAddress: tokenAddr,
                            symbol,
                            name,
                            decimals,
                            balance: formatBalance(balance, decimals),
                            rawBalance: balance.toString(),
                            hasBalance: !balance.isZero()
                        };
                    } catch (error) {
                        console.error(`Error fetching details for token ${tokenAddr}: ${error.message}`);
                        return null;
                    }
                });

                tokens = (await Promise.all(tokenPromises)).filter(token => token !== null);
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        address,
                        nativeToken: {
                            symbol: ABSTRACT_CONFIG.nativeToken.symbol,
                            balance: formattedNativeBalance,
                            rawBalance: nativeBalance.toString()
                        },
                        tokens,
                        tokenCount: tokens.length,
                        network: ABSTRACT_CONFIG.name,
                        chainId: ABSTRACT_CONFIG.chainId,
                        timestamp: new Date().toISOString()
                    }, null, 2)
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get wallet balances: ${error.message}`);
        }
    }
);

// Tool: Get ERC20 token supply
server.tool(
    "getTokenSupply",
    "Get total supply for an ERC20 token on Abstract Chain",
    {
        tokenAddress: z.string().describe("ERC20 token contract address")
    },
    async ({ tokenAddress }) => {
        try {
            const provider = getProvider();
            const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);

            const [symbol, name, decimals, totalSupply] = await Promise.all([
                tokenContract.symbol(),
                tokenContract.name(),
                tokenContract.decimals(),
                tokenContract.totalSupply()
            ]);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        tokenAddress,
                        tokenName: name,
                        symbol,
                        decimals,
                        totalSupply: formatBalance(totalSupply, decimals),
                        rawTotalSupply: totalSupply.toString()
                    }, null, 2)
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get token supply: ${error.message}`);
        }
    }
);

// Tool: Get token info
server.tool(
    "getTokenInfo",
    "Get information about an ERC20 token on Abstract Chain",
    {
        tokenAddress: z.string().describe("ERC20 token contract address on Abstract Chain")
    },
    async ({ tokenAddress }) => {
        try {
            const provider = getProvider();
            const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);

            const [symbol, name, decimals, totalSupply] = await Promise.all([
                tokenContract.symbol(),
                tokenContract.name(),
                tokenContract.decimals(),
                tokenContract.totalSupply()
            ]);

            const formattedSupply = formatBalance(totalSupply, decimals);

            const tokenInfo = {
                tokenAddress,
                tokenName: name,
                symbol,
                decimals,
                totalSupply: formattedSupply,
                rawTotalSupply: totalSupply.toString(),
                network: {
                    name: ABSTRACT_CONFIG.name,
                    chainId: ABSTRACT_CONFIG.chainId
                },
                metadata: {
                    formattedSupply: `${Number(formattedSupply).toLocaleString()} ${symbol}`,
                    tokenType: "ERC20",
                    timestamp: new Date().toISOString()
                }
            };

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(tokenInfo, null, 2)
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get token information: ${error.message}`);
        }
    }
);

// Tool: Get transaction receipt
server.tool(
    "getTransactionData",
    "Get transaction information on Abstract Chain",
    {
        txHash: z.string().describe("Transaction hash to check")
    },
    async ({ txHash }) => {
        try {
            const provider = getProvider();
            const receipt = await provider.getTransactionReceipt(txHash);

            if (!receipt) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: "pending",
                            message: "Transaction is pending or not found on the blockchain"
                        }, null, 2)
                    }]
                };
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        txHash,
                        blockNumber: receipt.blockNumber,
                        blockHash: receipt.blockHash,
                        status: receipt.status ? "success" : "failed",
                        gasUsed: receipt.gasUsed.toString(),
                        from: receipt.from,
                        to: receipt.to,
                        contractAddress: receipt.contractAddress,
                        logs: receipt.logs.map(log => ({
                            address: log.address,
                            topics: log.topics,
                            data: log.data
                        }))
                    }, null, 2)
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get transaction receipt: ${error.message}`);
        }
    }
);

// Tool: Get block information
server.tool(
    "getBlockInfo",
    "Get information about a block on Abstract Chain",
    {
        blockHash: z.string().describe("Block hash")
    },
    async ({ blockHash }) => {
        try {
            const provider = getProvider();

            if (!blockHash.startsWith("0x")) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: "error",
                            message: "Invalid block hash format. Block hash must start with 0x.",
                            requestedBlockHash: blockHash
                        }, null, 2)
                    }]
                };
            }

            const block = await provider.getBlock(blockHash);

            if (!block) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            status: "not found",
                            message: "Block not found on the blockchain"
                        }, null, 2)
                    }]
                };
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        blockNumber: block.number,
                        blockHash: block.hash,
                        timestamp: new Date(block.timestamp * 1000).toISOString(),
                        parentHash: block.parentHash,
                        miner: block.miner,
                        gasUsed: block.gasUsed.toString(),
                        gasLimit: block.gasLimit.toString(),
                        transactions: block.transactions,
                        transactionCount: block.transactions.length
                    }, null, 2)
                }]
            };
        } catch (error) {
            throw new Error(`Failed to get block information: ${error.message}`);
        }
    }
);


// Start the server
async function startServer() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.log("Abstract Chain MCP server started successfully");
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
}

startServer();