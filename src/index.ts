import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define Token type
type Token = Record<{
    id: string;
    name: string;               // name of token
    symbol: string;             // symbol of token
    decimals: nat64;            // decimals of token
    totalSupply: nat64;         // total supply of token
    description: string;        // description of token
    contractAddress: string;    // smart contract address of token
    blockchainId: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>

// Define Blockchain network type
type Blockchain = Record<{
    id: string;
    name: string;           // name of blockchain
    description: string;    // description of blockchain
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>

// Define TokenPayload for creating/updating tokenStorage
type TokenPayload = Record<{
    name: string;               // name of token
    symbol: string;             // symbol of token
    decimals: nat64;            // decimals of token
    totalSupply: nat64;         // total supply of token
    description: string;        // description of token
    contractAddress: string;    // smart contract address of token
    blockchainId: string;
}>

// Define BlockchainPayload for creating/updating blockchainStorage
type BlockchainPayload = Record<{
    name: string;           // name of blockchain
    description: string;    // description of blockchain
}>

// Create a new StableBTreeMap to store tokens, blockchains
const tokenStorage = new StableBTreeMap<string, Token>(0, 44, 1024);
const blockchainStorage = new StableBTreeMap<string, Blockchain>(1, 44, 1024);

$query;
// Find all tokens info
export function getTokens(): Result<Vec<Token>, string> {
    return Result.Ok(tokenStorage.values());
}

$query;
// Find all blockchains info
export function getBlockchains(): Result<Vec<Blockchain>, string> {
    return Result.Ok(blockchainStorage.values());
}

$query;
// Find token info by token ID
export function getToken(id: string): Result<Token, string> {
    return match(tokenStorage.get(id), {
        Some: (token) => Result.Ok<Token, string>(token),
        None: () => Result.Err<Token, string>(`token with id=${id} not found`)
    });
}

$query;
// Find blockchain info by blockchain ID
export function getBlockchain(id: string): Result<Blockchain, string> {
    return match(blockchainStorage.get(id), {
        Some: (blockchain) => Result.Ok<Blockchain, string>(blockchain),
        None: () => Result.Err<Blockchain, string>(`blockchain with id=${id} not found`)
    });
}

$query;
// Find blockchain info by blockchain name
export function getBlockchainByName(name: string): Result<Blockchain, string> {
    const blockchains = blockchainStorage.values();
    for (const blockchain of blockchains) {
        if (blockchain.name == name) {
            return Result.Ok<Blockchain, string>(blockchain);
        }
    }
    return Result.Err<Blockchain, string>(`Blockchain with name = ${name} not found`);
}

$query;
// Find all tokens by blockchain id
export function getTokensByBlockchainId(blockchainId: string): Result<Vec<Token>, string> {
    const tokens = tokenStorage.values();
    const returnedTokens: Token[] = [];

    for (const token of tokens) {
        if (token.blockchainId == blockchainId) {
            returnedTokens.push(token);
        }
    }

    return Result.Ok(returnedTokens);
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

$query;
// Find token by token contract address
export function getTokenByContractAddress(contractAddress: string): Result<Token, string> {
    const tokens = tokenStorage.values();
    for (const token of tokens) {
        if (token.contractAddress == contractAddress) {
            return Result.Ok(token);
        }
    }
    return Result.Err<Token, string>(`token with contractAddress=${contractAddress} not found`);
}

$update;
// Create new blockchain
export function createBlockchain(payload: BlockchainPayload): Result<Blockchain, string> {
    const blockchain: Blockchain = {
        id: uuidv4(), // Generate unique ID for new blockchain
        createdAt: ic.time(),
        updatedAt: Opt.None,
        ...payload,
    };

    // revert if blockchain already exist
    const blockchains = blockchainStorage.values();
    for (const chain of blockchains) {
        if (chain.name == blockchain.name) {
            return Result.Err<Blockchain, string>(`blockchain already exist`);
        }
    }
    blockchainStorage.insert(blockchain.id, blockchain); // store new blockchain
    return Result.Ok(blockchain);
}

$update;
// Update blockchain info by blockchain id
export function updateBlockchain(id: string, payload: BlockchainPayload): Result<Blockchain, string> {
    return match(blockchainStorage.get(id), {
        Some: (blockchain: Blockchain) => {
            const updatedBlockchain: Blockchain = {
                ...blockchain,
                ...payload,
                updatedAt: Opt.Some(ic.time()), // Set the update time to current time
            };
            blockchainStorage.insert(blockchain.id, updatedBlockchain);
            return Result.Ok<Blockchain, string>(updatedBlockchain);
        },
        None: () => Result.Err<Blockchain, string>(`Blockchain with id=${id} not found`)
    });
}

$update;
// create new token
export function createToken(payload: TokenPayload): Result<Token, string> {
    const token: Token = {
        id: uuidv4(),
        createdAt: ic.time(),
        updatedAt: Opt.None,
        ...payload,
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

    // Revert if author not exist
    if (blockchainId == "") {
        return Result.Err<Token, string>(`blockchain with id ${payload.blockchainId} not found`);
    }

    tokenStorage.insert(token.id, token); // store the token in token storage
    return Result.Ok(token);
}

$update;
// Update token info
export function updateToken(id: string, payload: TokenPayload): Result<Token, string> {
    return match(tokenStorage.get(id), {
        Some: (token: Token) => {
            const updatedToken: Token = {
                ...token,
                ...payload,
                updatedAt: Opt.Some(ic.time()), // update time to current time
            };
            tokenStorage.insert(token.id, updatedToken);
            return Result.Ok<Token, string>(updatedToken);
        },
        None: () => Result.Err<Token, string>(`Token with id=${id} not found`)
    });
}

$update;
// Delete token
export function deleteToken(id: string): Result<string, string> {
    return match(tokenStorage.get(id), {
        Some: (token: Token) => {
            tokenStorage.remove(id); // remove token from token storage
            return Result.Ok<string, string>(`Token deleted success`);
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