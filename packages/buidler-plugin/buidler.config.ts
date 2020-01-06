import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config";
import waffleDefaultAccounts from "ethereum-waffle/dist/config/defaultAccounts";

import "./tasks/apm";
import "./tasks/deploy";
import "./tasks/ipfs";
import "./tasks/publish";
import "./tasks/run";
import "./tasks/start-client";
// #### TEST
import "./tasks/test-import";

usePlugin("@nomiclabs/buidler-ethers");
usePlugin("@nomiclabs/buidler-truffle5");
usePlugin("@nomiclabs/buidler-web3");
usePlugin("buidler-typechain");

const INFURA_API_KEY = "";
const RINKEBY_PRIVATE_KEY = "";

const config: BuidlerConfig = {
  solc: {
    version: "0.5.12"
  },
  paths: {
    artifacts: "./build"
  },
  networks: {
    buidlerevm: {
      accounts: waffleDefaultAccounts.map(acc => ({
        balance: acc.balance,
        privateKey: acc.secretKey
      }))
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [RINKEBY_PRIVATE_KEY]
    },
    local: {
      url: "http://localhost:8545",
      accounts: [
        "0xa8a54b2d8197bc0b19bb8a084031be71835580a01e70a45a13babd16c9bc1563",
        "0xce8e3bda3b44269c147747a373646393b1504bfcbb73fc9564f5d753d8116608"
      ]
    },
    "aragon:rinkeby": {
      url: "https://rinkeby.eth.aragon.network"
      // registry: "0x98df287b6c145399aaa709692c8d308357bc085d",
      // network: "rinkeby"
    },
    "aragon:staging": {
      url: "https://rinkeby.eth.aragon.network"
      // registry: "0xfe03625ea880a8cba336f9b5ad6e15b0a3b5a939",
      // network: "rinkeby"
    },
    "aragon:mainnet": {
      url: "https://mainnet.eth.aragon.network"
      // registry: "0x314159265dd8dbb310642f98f50c066173c1259b",
      // network: "mainnet"
    }
  },
  defaultNetwork: "buidlerevm",
  typechain: {
    outDir: "typechain",
    target: "ethers"
  }
};

export default config;
