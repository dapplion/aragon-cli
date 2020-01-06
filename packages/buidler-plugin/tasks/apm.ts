import { TASK_APM_PUBLISH, TASK_APM_VIEW } from "./task-names";
import { task } from "@nomiclabs/buidler/config";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import { ethers } from "ethers";

// Bare minimum commands required by `publish` to interact with
// the APM contracts

// QUESTION / TODO: Should the buidler aragon CLI support this commands?
// - [x] apm publish <bump> [contract]         Publish a new version of the application
// - [ ] apm extract-functions [contract]      Extract function information from a Solidity file
// - [ ] apm grant [grantees..]                Grant an address permission to create new versions in this package
// - [ ] apm info <apmRepo> [apmRepoVersion]   Get information about a package
// - [ ] apm packages [apmRegistry]            List all packages in the registry
// - [ ] apm version [bump]                    (deprecated) Bump the application version
// - [ ] apm versions [apmRepo]                Shows all the previously published versions of a given repository

task(TASK_APM_PUBLISH, "Publish version to APM")
  .addParam("contentHash", "Content hash of the release")
  .addParam("contractAddress", "Contract address of the release")
  .setAction(taskApmPublish);

task(TASK_APM_VIEW, "View an APM registry")
  .addOptionalPositionalParam("apmRegistry", "Registry to inspect")
  .setAction(taskApmView);

/**
 * Publishes a version to APM
 *  - Should NOT be concerned with uploading content,
 *    only interacting with a blockchain
 * [EMPTY] [MOCK]
 * @return APM version
 */
export async function taskApmPublish(
  taskArgs: {
    contentHash: string;
    contractAddress: string;
  },
  env: BuidlerRuntimeEnvironment
): Promise<{ contentUri: string; contractAddress: string }> {
  const { contentHash, contractAddress } = taskArgs;
  const contentUri = `ipfs:${contentHash}`;
  return { contentUri, contractAddress };
}

/**
 * View an APM registry
 */
export async function taskApmView(
  taskArgs: {
    apmRegistry: string;
  },
  env: BuidlerRuntimeEnvironment
): Promise<void> {
  const apmRegistry = taskArgs.apmRegistry || "aragonpm.eth";
  if (!taskArgs.apmRegistry) console.log(`Defaulting to aragonpm.eth`);

  const registryAbi = await import("@aragon/os/abi/APMRegistry.json");
  const registryInterface = new ethers.utils.Interface(registryAbi.abi);

  const newRepoEvent = "NewRepo";
  const result = await env.ethers.provider.getLogs({
    address: await resolveName(apmRegistry, env),
    fromBlock: 0,
    toBlock: "latest",
    topics: [registryInterface.events[newRepoEvent].topic]
  });

  const events = result.map(event => {
    const parsedLog = registryInterface.parseLog(event);
    return {
      blockNumber: event.blockNumber || 0,
      id: parsedLog.values.id as string,
      name: parsedLog.values.name as string,
      repo: parsedLog.values.repo as string
    };
  });

  console.log(
    events
      .reverse()
      .map(({ blockNumber, name }) => `  ${blockNumber} - ${name}`)
      .join("\n")
  );
}

/**
 * Wrapper around `ethers.resolveName` also resolve on the Aragon devchain
 * custom deployed ENS registry
 * @param name "aragonpm.eth"
 * @param env Buidler runtime environment
 */
async function resolveName(
  name: string,
  env: BuidlerRuntimeEnvironment
): Promise<string> {
  const provider = env.ethers.provider;
  if (env.network.name !== "local") return provider.resolveName(name);

  /**
   * Patch for resolving ens names for the Aragon devchain
   */
  const ensAddr = "0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1";
  const ensAbi = [
    "function resolver(bytes32 nodeHash) constant returns (address resolver)"
  ];
  const resolverAbi = [
    "function addr(bytes32 nodeHash) constant returns (address addr)"
  ];
  const ens = new ethers.Contract(ensAddr, ensAbi, provider);
  const node = ethers.utils.namehash(name);
  const resolverAddr: string = await ens.resolver(node);
  const resolver = new ethers.Contract(resolverAddr, resolverAbi, provider);
  const addr: string = await resolver.addr(node);
  return addr;
}
