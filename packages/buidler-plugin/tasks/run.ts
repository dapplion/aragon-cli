import open from "open";
import { taskPublish } from "./publish";
import { TASK_START } from "./task-names";
import { task } from "@nomiclabs/buidler/config";

// Recreates `aragon run` command

// NOTE: `buidler run` is fundamental command to run other commands,
// we may want to change it's name; so right now `buidler start` = `aragon run`
// NOTE: Moving to buidler is a great opportunity to re-write this command
// given its difficulty refactoring in the context of the current CLI
// Below are commented all the subtask that make up the publish command
// This should serve a rough guide to progressively implement the command

// QUESTION / TODO:
// 1) ENS, APM and DAO templates are necessary to run this command.
//    Will these be provided by a testnet snapshot? Will be deployed on each run?
// 2) `dao new` logic should be in this buidler plugin, or in the toolkit?

task(TASK_START, "Runs an Aragon app").setAction(async (taskArgs, env) => {
  const contractName = "Counter";
  // 1. Start a local Ethereum network. Run devchain and get accounts to ctx

  // 2,3,4 Publish
  // Untyped!
  // const version = await env.run(TASK_PUBLISH, { contractName });
  // Typed!
  const version = await taskPublish({ contractName }, env);

  // 5. Fetch published repo: `getRepoTask()` = `apm.getVersion()`
  console.log(version);

  // 6. Deploy Template: `deployTask()`
  //     6.1. Compile contracts: `compileContracts()`
  //     6.2. Deploy contract to network: `deployContract()` = web3 deploy + sendTx
  //     6.3. Generate deployment artifacts: `deployArtifacts()` = `flattenCode()`

  // 7. Create Organization: `newDAOTask()`
  //     7.1. Fetching template: `toolkit.getApmRepo()`
  //     7.2. Create new DAO from template: `toolkit.newDao()`
  //     7.3. Assigning Aragon Id: `toolkit.assignId()`

  // 8. Start Client: `startTask()`
  //     8.1. Fetching client from aragen
  //     8.2. Downloading client
  //     8.3. Installing client dependencies
  //     8.4. Building Aragon client
  //     8.5. Starting Aragon client
  //     8.6. Opening client
  await open(
    `http://localhost:8080/ipfs/${version.contentUri.replace("ipfs:", "")}`
  );

  await new Promise(r => {});
});

export default {};
