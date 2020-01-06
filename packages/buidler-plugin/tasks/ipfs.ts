import { TASK_IPFS_START } from "./task-names";
import { task } from "@nomiclabs/buidler/config";
const Ctl = require("ipfsd-ctl");

// Handles, starts or connects to an IPFS node
// - [x] In dev: Starts a disposable node
// - [ ] In production: Connects to a remote node
// Takes advantage of the singleton nature of ES6 modules
// to keep a single global instance of IPFS per run

// QUESTION / TODO: Since it's possible to run a javascript node
// does it make sense to still install / uninstall / initialize
// a node (and its related commands)?

task(TASK_IPFS_START, "Start local IPFS node").setAction(
  async (taskArgs, env) => {
    await getIpfs();
    await new Promise(r => {});
  }
);

// Globaly unique instance
let ipfsApiInstance: any;

/**
 * Starts a javascript IPFS disposable node.
 * This instance is dependant to this NodeJS process,
 * if the process stops the IPFS instance will stop too
 * [NOTE]: It is easy to extend this function to attach to existing IPFS
 * instances if any via HTTP
 * [NOTE]: Use its API directly with:
 *   const id = await ipfsd.api.id()
 */
async function startIpfsChild() {
  const factory = Ctl.createFactory();
  return await factory.spawn();
}

export async function getIpfs() {
  if (!ipfsApiInstance) {
    const ipfsDeamon = await startIpfsChild();
    ipfsApiInstance = ipfsDeamon.api;
  }
  return ipfsApiInstance;
}
