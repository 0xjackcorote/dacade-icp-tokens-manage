import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define Token type
type Token = Record<{
    id: string;
    name: string;
    symbol: string;
    decimals: nat64;
    totalSupply: nat64;
    description: string;
    contractAddress: string;
    blockchainId: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>;

// Define Blockchain network type
type Blockchain = Record<{
    id: string;
    name: string;
    description: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>;

// Define TokenPayload for creating/updating tokenStorage
type TokenPayload = Record<{
    name: string;
    symbol: string;
    decimals: nat64;
    totalSupply: nat64;
    description: string;
    contractAddress: string;
    blockchainId: string;
}>;

// Define BlockchainPayload for creating/updating blockchainStorage
type BlockchainPayload = Record<{
    name: string;
    description: string;
}>;

// Create a new StableBTreeMap to store tokens, blockchains
const tokenStorage = new StableBTreeMap<string, Token>(0, 44, 1024);
const blockchainStorage = new StableBTreeMap<string, Blockchain>(1, 44, 1024);

$query;
// Find token info by token ID
export function getTokenById(id: string): Result<Token, string> {
    // Validate parameters
    if (!id) {
        return Result.Err('Invalid parameters for getting token');
    }

    return match(tokenStorage.get(id), {
        Some: (token) => Result.Ok<Token, string>(token),
        None: () => Result.Err<Token, string>(`Token with id=${id} not found`),
    });
}

$query;
// Find blockchain info by blockchain ID
export function getBlockchainById(id: string): Result<Blockchain, string> {
    // Validate parameters
    if (!id) {
        return Result.Err('Invalid parameters for getting blockchain');
    }

    return match(blockchainStorage.get(id), {
        Some: (blockchain) => Result.Ok<Blockchain, string>(blockchain),
        None: () => Result.Err<Blockchain, string>(`Blockchain with id=${id} not found`),
    });
}

$query;
// Find blockchain info by blockchain name
export function getBlockchainByName(name: string): Result<Blockchain, string> {
    // Validate parameters
    if (!name) {
        return Result.Err('Invalid parameters for getting blockchain');
    }
    const blockchains = blockchainStorage.values();
    for (const blockchain of blockchains) {
        if (blockchain.name == name) {
            return Result.Ok<Blockchain, string>(blockchain);
        }
    }
    return Result.Err<Blockchain, string>(`Blockchain with name = ${name} not found`);
}

// Update blockchain info by blockchain id
$update;
export function updateBlockchain(id: string, payload: BlockchainPayload): Result<Blockchain, string> {
    // Validate parameters
    if (!id) {
        return Result.Err('Invalid parameters for updating blockchain');
    }

    // Validate payload
    if (!payload.name || !payload.description) {
        return Result.Err<Blockchain, string>('Invalid payload for updating blockchain');
    }
    return match(blockchainStorage.get(id), {
        Some: (blockchain: Blockchain) => {

            try {
                // Set each property individually
                const updatedBlockchain: Blockchain = {
                    id: blockchain.id,
                    name: payload.name,
                    description: payload.description,
                    createdAt: blockchain.createdAt,
                    updatedAt: Opt.Some(ic.time()),
                };

                blockchainStorage.insert(blockchain.id, updatedBlockchain);
                return Result.Ok<Blockchain, string>(updatedBlockchain);
            } catch (error: any) {
                return Result.Err<Blockchain, string>(error.message || 'Failed to update blockchain');
            }
        },
        None: () => Result.Err<Blockchain, string>(`Blockchain with id=${id} not found`),
    });
}

// Find all tokens info
$query;
export function getTokens(): Result<Vec<Token>, string> {
    try {
        return Result.Ok(tokenStorage.values());
    } catch (error) {
        return Result.Err<Vec<Token>, string>('Failed while trying to get tokens');
    }
}

// Find all blockchains info
$query;
export function getBlockchains(): Result<Vec<Blockchain>, string> {
    try {
        return Result.Ok(blockchainStorage.values());
    } catch (error) {
        return Result.Err<Vec<Blockchain>, string>('Failed while trying to get blockchains');
    }
}

$query;
// Find token info by token contract address
export function getTokenByContractAddress(contractAddress: string): Result<Token, string> {
    const tokens = tokenStorage.values();
    for (const token of tokens) {
        if (token.contractAddress == contractAddress) {
            return Result.Ok(token);
        }
    }
    return Result.Err<Token, string>(`Token with contractAddress=${contractAddress} not found`);
}

$query;
// Find all tokens by blockchain id
export function getTokensByBlockchainId(blockchainId: string): Result<Vec<Token>, string> {

    // Validate parameters
    if (!blockchainId) {
        return Result.Err('Invalid parameters for getting blockchain');
    }

    try {
        const tokens = tokenStorage.values();
        const returnedTokens: Token[] = [];

        for (const token of tokens) {
            if (token.blockchainId == blockchainId) {
                returnedTokens.push(token);
            }
        }

        return Result.Ok(returnedTokens);
    } catch (error) {
        return Result.Err<Vec<Token>, string>('Failed while trying to get tokens by blockchainId');
    }
}

$query;
// Find all tokens by blockchain name
export function getTokensByBlockchainName(blockchainName: string): Result<Vec<Token>, string> {
    const blockchains = blockchainStorage.values();
    let blockchainId: string = '';

    for (const blockchain of blockchains) {
        if (blockchain.name == blockchainName) {
            blockchainId = blockchain.id;
            break;
        }
    }

    const tokens = tokenStorage.values();
    const returnedTokens: Token[] = [];

    for (const token of tokens) {
        if (token.blockchainId == blockchainId) {
            returnedTokens.push(token);
        }
    }

    return Result.Ok(returnedTokens);
}

$update;
// Create new blockchain
export function createBlockchain(payload: BlockchainPayload): Result<Blockchain, string> {
    // Validate payload
    if (!payload.name || !payload.description) {
        return Result.Err('Invalid payload for creating blockchain');
    }

    const blockchain: Blockchain = {
        id: uuidv4(), // Generate unique ID for new blockchain
        createdAt: ic.time(),
        updatedAt: Opt.None,
        name: payload.name,
        description: payload.description,
    };

    // Revert if blockchain already exists
    const blockchains = blockchainStorage.values();
    for (const chain of blockchains) {
        if (chain.name == blockchain.name) {
            return Result.Err<Blockchain, string>('Blockchain already exists');
        }
    }

    blockchainStorage.insert(blockchain.id, blockchain); // store new blockchain
    return Result.Ok(blockchain);
}

$update;
// Update token info
export function updateToken(id: string, payload: TokenPayload): Result<Token, string> {
    // Validate parameters
    if (!id) {
        return Result.Err('Invalid parameters for updating token');
    }

    // Validate payload
    if (!payload.name || !payload.symbol || !payload.decimals || !payload.totalSupply || !payload.description || !payload.contractAddress || !payload.blockchainId) {
        return Result.Err('Invalid payload for updating token');
    }

    if (payload.totalSupply <= 0) {
        return Result.Err('Invalid parameters totalSupply is always greater than zero');
    }
    return match(tokenStorage.get(id), {
        Some: (token: Token) => {


            try {
                // Set each property individually
                const updatedToken: Token = {
                    id: token.id,
                    name: payload.name,
                    symbol: payload.symbol,
                    decimals: payload.decimals,
                    totalSupply: payload.totalSupply,
                    description: payload.description,
                    contractAddress: payload.contractAddress,
                    blockchainId: payload.blockchainId,
                    createdAt: token.createdAt,
                    updatedAt: Opt.Some(ic.time()),
                };

                tokenStorage.insert(token.id, updatedToken);
                return Result.Ok<Token, string>(updatedToken);
            } catch (error: any) {
                return Result.Err<Token, string>(error.message || 'Failed to update token');
            }
        },
        None: () => Result.Err<Token, string>(`Token with id=${id} not found`),
    });
}

$update;
// Create new token
export function createToken(payload: TokenPayload): Result<Token, string> {
    // Validate payload
    if (!payload.name || !payload.symbol || !payload.decimals || !payload.totalSupply || !payload.description || !payload.contractAddress || !payload.blockchainId) {
        return Result.Err('Invalid payload for creating token');
    }

    if (payload.totalSupply <= 0) {
        return Result.Err('Invalid parameters totalSupply is always greater than zero');
    }


    const token: Token = {
        id: uuidv4(),
        createdAt: ic.time(),
        updatedAt: Opt.None,
        name: payload.name,
        symbol: payload.symbol,
        decimals: payload.decimals,
        totalSupply: payload.totalSupply,
        description: payload.description,
        contractAddress: payload.contractAddress,
        blockchainId: payload.blockchainId,
    };

    // find blockchain
    let blockchainId = "";
    const blockchains = blockchainStorage.values();
    for (const blockchain of blockchains) {
        if (blockchain.id == payload.blockchainId) {
            blockchainId = payload.blockchainId;
            break;
        }
    }

    // Revert if blockchain does not exist
    if (blockchainId == "") {
        return Result.Err<Token, string>(`Blockchain with id ${payload.blockchainId} not found`);
    }

    tokenStorage.insert(token.id, token); // store the token in token storage
    return Result.Ok(token);
}

$update;
// Delete token
export function deleteToken(id: string): Result<string, string> {
    // Validate parameters
    if (!id) {
        return Result.Err('Invalid parameters for deleting token');
    }

    return match(tokenStorage.get(id), {
        Some: (token: Token) => {
            tokenStorage.remove(id); // remove token from token storage
            return Result.Ok<string, string>('Token deleted successfully');
        },
        None: () => {
            return Result.Err<string, string>(`Token with id=${id} not found`);
        },
    });
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    },
};
