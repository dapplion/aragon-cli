import fs from "fs";
import { getIpfs } from "./ipfs";
import {
  TASK_PUBLISH,
  TASK_PUBLISH_GENERATE_ARTIFACTS,
  TASK_PUBLISH_UPLOAD_ARTIFACTS,
  TASK_FLATTEN_GET_FLATTENED_SOURCE
} from "./task-names";
import { task, internalTask } from "@nomiclabs/buidler/config";
import { taskApmPublish } from "./apm";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import { taskDeploy } from "./deploy";

// Recreates `aragon publish` command

// NOTE: Moving to buidler is a great opportunity to re-write this command
// given its difficulty refactoring in the context of the current CLI
// Below are commented all the subtask that make up the publish command
// This should serve a rough guide to progressively implement the command

// QUESTION / TODO:
// 1) Regarding steps 3.3 / 4.1 below, why does this command produce an aragon.js intent
//    if latter it sends the transaction by itself?

task(TASK_PUBLISH, "Publish app version to APM")
  .addParam("contractName", "Main contract name to release")
  .setAction(taskPublish);

internalTask(TASK_PUBLISH_GENERATE_ARTIFACTS, taskPublishGenerateArtifacts);
internalTask(TASK_PUBLISH_UPLOAD_ARTIFACTS, taskPublishUploadArtifacts);

/**
 * Prepare and publish a version to APM
 * - Main task, delegates to other tasks and internal tasks
 */
export async function taskPublish(
  taskArgs: { contractName: string },
  env: BuidlerRuntimeEnvironment
) {
  const { contractName } = taskArgs;

  // 2. Setup before publish: `runSetupTask()`
  //     2.1. Running prepublish script: `runScriptTask()`
  //     2.2. Validate version bump: Fetches current version
  //     2.3. Building frontend: `runScriptTask()`
  //     2.4. Compile contracts: `compileContracts()`
  await env.run("compile");
  //     2.5. Deploy contract: `deployTask()`
  const contractAddress = await taskDeploy({ contractName }, env);
  //     2.6. Determine contract address for version: ???

  // 3. Prepare for publish: `runPrepareForPublishTask()`
  //     3.1. Prepare files for publishing: `prepareFilesForPublishing()`
  //          Copy app files to a tmp dir
  //     3.2. Generate application artifact: `generateApplicationArtifact()`
  //          Copy contract files to a tmp dir
  await taskPublishGenerateArtifacts({ contractName }, env);
  //     3.3. Publish intent: `apm.publishVersionIntent()`
  //          Add previous dirs to IPFS
  //          Prepare a publish version to APM TX (aragon.js intent)
  const contentHash = await taskPublishUploadArtifacts({}, env);
  // 4. Publish app to aragonPM: `runPublishTask()`
  //     4.1. Publish app: `apm.publishVersion()`, sendTx()`
  //          Actually send to web3 the APM publish TX
  const version = await taskApmPublish({ contentHash, contractAddress }, env);

  return version;
}

/**
 * Generates all necessary artifacts for a release
 * [MOCK]
 *  - Flattens the main contract and writes it to ./build
 */
async function taskPublishGenerateArtifacts(
  taskArgs: { contractName: string },
  env: BuidlerRuntimeEnvironment
): Promise<void> {
  const contractName = taskArgs.contractName;
  const contractSource = await env.run(TASK_FLATTEN_GET_FLATTENED_SOURCE);
  fs.writeFileSync(`./build/${contractName}.flat.sol`, contractSource);
}

/**
 * Uploads to IPFS all necessary artifacts for a release
 * [MOCK]
 *  - Uploads all ./build contents without filters
 * @return hash "QmXb96jfktnd7CWWPku5hm1vfifGFUSDeRPFCdxivouxhL"
 * The "ipfs:" prefix should be added later in an APM dedicated function
 */
async function taskPublishUploadArtifacts(
  taskArgs: {},
  env: BuidlerRuntimeEnvironment
): Promise<string> {
  const ipfs = await getIpfs();
  const results = await ipfs.addFromFs("./build", {
    recursive: true,
    ignore: ["subfolder/to/ignore/**"]
  });
  const { hash } = results.pop();
  return hash;
}
