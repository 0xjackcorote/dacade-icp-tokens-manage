# Tokens Manage ICP

## Setup and deploy canister
```bash
yarn
dfx start --background --clean
dfx deploy
```

## Functions

1. Create new blockchain info
2. Update blockchain info
3. Create new token info
4. Update token info
5. Delete token info
6. Find all blockchains info
7. Find all tokens info
8. Find token info by token Id
9. Find tokens by blockchain ID
10. Find tokens by blockchain name
11. Find token by contract address
12. Find blockchain info by blockchain id
13. Find blockchain info by blockchain name

## Guide

### Create new blockchain info
```bash
dfx canister call tokens_manage createBlockchain '(record {"name"="ETH"; "description"="Ethereum"})'
```
 
### Update blockchain info
```bash
dfx canister call tokens_manage updateBlockchain '("1deb3f56-7648-43a4-9ad8-df8396f0eada", record {"name"="ETH"; "description"="Updated desc"})'
```
 
### Create new token info
```bash
dfx canister call tokens_manage createToken '(record {"name"="Dacade"; "symbol"="DAC"; "decimals"=18; "totalSupply"=1000000; "description"="Dacade token"; "contractAddress"="0xdacade"; "blockchainId"="1deb3f56-7648-43a4-9ad8-df8396f0eada"})'
```
 
### Update token info
```bash
dfx canister call tokens_manage updateToken '("d4b79a44-8011-430d-b261-1245f5bab968", record {"name"="Dacade"; "symbol"="DAC"; "decimals"=18; "totalSupply"=1000000; "description"="Dacade token updated"; "contractAddress"="0xdacade"; "blockchainId"="1deb3f56-7648-43a4-9ad8-df8396f0eada"})'
```
 
### Delete token info
```bash
dfx canister call tokens_manage deleteToken '("d4b79a44-8011-430d-b261-1245f5bab968")'
```
 
### Find all blockchains info
```bash
dfx canister call tokens_manage getBlockchains '()'
```
 
### Find all tokens info
```bash
dfx canister call tokens_manage getTokens '()'
```
 
### Find token info by token Id
```bash
dfx canister call tokens_manage getToken '("d4b79a44-8011-430d-b261-1245f5bab968")'
```
 
### Find tokens by blockchain ID
```bash
dfx canister call tokens_manage getBlockchain '("1deb3f56-7648-43a4-9ad8-df8396f0eada")'
```
 
### Find tokens by blockchain name
```bash
dfx canister call tokens_manage getTokensByBlockchainName '("ETH")'
```
 
### Find token by contract address
```bash
dfx canister call tokens_manage getTokenByContractAddress '("0xdacade")'
```
 
### Find blockchain info by blockchain id
```bash
dfx canister call tokens_manage getTokensByBlockchainId '("1deb3f56-7648-43a4-9ad8-df8396f0eada")'
```
 
### Find blockchain info by blockchain name
```bash
dfx canister call tokens_manage getBlockchainByName '("ETH")'
```
