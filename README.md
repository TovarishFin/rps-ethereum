# rps ethereum
This is a complete and working dapp which facilitates wagering any ERC20 token on rock paper scissors games.

Some other interesting features are:
* extensive smart contract tests (Upgradeable and Proxy are missing but tested in another repo...)
* a pattern to have a single contract which gets around the gas limit via upgradeable proxies
* a working referral program
* graceful metamask handling (only ask for access or prompt user to isntall metamask when needed)
* a bank for depositing ether and any other tokens
* a faucet to receive test tokens for wagering and demos
* a special page to play more than one game at once

You can view and use the dapp on ropsten [here](https://tovarishfin.github.io/rps-ethereum/).
Direct links to pages will not work when loaded directly due to the way single page applications work with github pages. This works normally on a normal server though.

## Stack
This projects main dependencies are:
* OpenZeppelin
* Truffle
* Vue
* Vue Router
* Vuex
* Vuetify
* Web3

## Project setup
The project uses the same repository for both the smart contracts and the dapp.

This project has hard coded mnemonic phrases which are used to create accounts in a consistent way for development.

DO NOT USE THESE MNEMONICS WITH ANY REAL ETHER

### Install Dependencies
```
yarn
```

### Dapp Setup
#### Compiles and hot-reloads dapp for development
```
yarn serve
```

#### Compiles and minifies dapp for production
```
yarn build:dapp
```

#### Run dapp unit tests (currently there are none for the client)
```
yarn test:dapp
```

#### Lints and fixes files
```
yarn lint:js
```

#### Run your end-to-end tests
```
yarn test:e2e
```

### Contracts Setup
#### Builds the smart contracts
```
yarn build:contracts
```

#### Lints smart contracts
```
yarn lint:sol
```

#### Test smart contracts
Ganche needs to be running in another window before running tests.
```
yarn start:blockchain
```

Once when ganache is running, open another window for the tests:
```
yarn test:contracts
```

#### Contract Deployment
Migrate the contracts to your network of choice, below uses local ganache:
```
yarn migrate:dev
```

other options are:
```
yarn migrate:ropsten
yarn migrate:kovan
yarn migrate:rinkeby
yarn migrate:mainnet
```

#### State setting scripts
In in the `scripts/` folder, you will find different scripts for different stages of a game. `allGames.js` creates a game at each different stage. 

These can be run using the following command:

replace `<your-network>` with the network you want to use (dev, ropsten, rinkeby etc...) and `<chosen-script>`a with one of the scripts in `scripts/`
```
yarn truffle exec --network <your-network> ./scripts/<chosen-script>
```

