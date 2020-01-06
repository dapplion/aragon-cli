import { TASK_DEPLOY } from "./task-names";
import { task } from "@nomiclabs/buidler/config";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";

// Generic deploy main contract task

// QUESTION / TODO: Is is necessary to expose this task in the
// context of an Aragon App? Does the user need to deploy
// this contract outside of a publish task?

task("test-import", "Test CLI import").setAction(taskTestImport);

/**
 * Deploys a contract given it's name
 * @return contractAddress "0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA"
 */
export async function taskTestImport(
  taskArgs: { contractName: string },
  env: BuidlerRuntimeEnvironment
): Promise<void> {
  console.log("Hello from test task import!");
}
