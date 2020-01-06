import path from "path";
import fs from "fs";
import os from "os";
import execa from "execa";
import open from "open";
import { TASK_START_CLIENT } from "./task-names";
import { task } from "@nomiclabs/buidler/config";
import createHttpServer from "../lib/createHttpServer";

const defaultRepo = "https://github.com/aragon/aragon";
const defaultVersion = "775edd606333a111eb2693df53900039722a95dc";
const defaultPort = 3000;
const aragonBaseDir = path.join(os.homedir(), ".aragon");

/**
 * Starts the aragon client at a given dao address
 */

task(TASK_START_CLIENT, "Start the Aragon GUI (graphical user interface)")
  .addOptionalParam(
    "clientRepo",
    "Aragon client repo to run your sandboxed app on (valid git repository: https or ssh)"
  )
  .addOptionalParam(
    "clientVersion",
    "Aragon client version to run your sandboxed app on (commit hash, branch or tag name)"
  )
  .addOptionalParam("daoAddress", "Address of the DAO to open the client to")
  .addOptionalParam("port", "Port being used by Aragon client")
  .addOptionalParam("clientPath", "fs path of an existing local Aragon client")
  .addOptionalParam("autoOpen", "automatically open the client in the browser")
  .setAction(async (taskArgs, env) => {
    const daoAddress: string = taskArgs.daoAddress || "";
    const isCustomClientPath = Boolean(taskArgs.clientPath);
    const isDefaultVersion = !taskArgs.clientVersion;
    const clientRepo: string = taskArgs.clientRepo || defaultRepo;
    const clientVersion: string = taskArgs.clientVersion || defaultVersion;
    const clientPort: number = parseInt(taskArgs.port) || defaultPort;
    const autoOpen: boolean = Boolean(taskArgs.autoOpen || true);

    const clientPath =
      taskArgs.clientPath ||
      path.join(aragonBaseDir, `client-${clientVersion}`);

    // Fetching client from aragen
    if (isCustomClientPath) {
      console.log("Using custom client path");
      // #### TODO: Verify it's fine?
    } else {
      // Make sure we haven't already downloaded the client
      if (fs.existsSync(path.resolve(clientPath))) {
        console.log("Using cached client version");
      } else {
        fs.mkdirSync(clientPath, { recursive: true });
        if (isDefaultVersion) {
          console.log("Copying client");
          // #### TODO: I don't understand this paths
          // await copy(
          //   path.resolve(
          //     path.resolve(require.resolve("@aragon/aragen"), "../ipfs-cache"),
          //     "@aragon/aragon"
          //   ),
          //   path.join(clientPath, "build")
          // );
        } else {
          console.log(`Installing client version ${clientVersion} locally`);
          const opts = { cwd: clientPath };
          await execaPipe("git", ["clone", "--", clientRepo, clientPath]);
          await execaPipe("git", ["checkout", clientVersion], opts);
          await execaPipe("npm", ["install"], opts);
          await execaPipe("npm", ["run", "build:local"], opts);
        }
      }
    }

    console.log(`Starting client server at port ${clientPort}`);
    await createHttpServer(clientPort, path.join(clientPath, "build"));

    const url = `http://localhost:${clientPort}/#/${daoAddress}`;
    clearConsole();
    console.log(`You can now view the Aragon client in the browser.

  Local:  ${url}

`);

    if (autoOpen) await open(url);

    await new Promise(r => {});
  });

export default {};

/**
 * execa wrapper that pipes stdout and stderr to the parent process
 */
function execaPipe(
  file: string,
  args?: readonly string[],
  options?: execa.Options
): execa.ExecaChildProcess {
  const subprocess = execa(file, args, options);
  if (subprocess.stdout) subprocess.stdout.pipe(process.stdout);
  if (subprocess.stderr) subprocess.stderr.pipe(process.stderr);
  return subprocess;
}

/**
 * Clears the console
 * From create-react-app/packages/react-dev-utils/clearConsole.js
 */
function clearConsole() {
  process.stdout.write(
    process.platform === "win32" ? "\x1B[2J\x1B[0f" : "\x1B[2J\x1B[3J\x1B[H"
  );
}
