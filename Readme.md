# Solana React Hooks

React hooks for web3 developemnt on Solana network.

## About

The package helps skyrocketing your React based web3 Solana project.
It provides utility hooks for different use-cases

- `useSolana`: Solana program helper methods

  - `getAccount` - Get account info from the corresponding program
  - `getProvider` - Get a new provider based on the connected wallet
  - `getProgram` - Get a new program based on the interface definition and the programId
  - `getOrCreateAccount` - It returns the account if it exists or create a new one if not
  - `createAccount` - Create a new account in the corresponding Solana program
    </br></br>

- `usePhantom`: Connect Phantom wallet
  - `walletAddress` - The wallet address
  - `connectWallet` - Function to connect the wallet
