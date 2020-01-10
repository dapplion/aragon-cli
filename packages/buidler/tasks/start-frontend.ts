import filewatcher from 'filewatcher';
import path from 'path';
import execa from 'execa';
import fs from 'fs';
import fsExtra from 'fs-extra';
import namehash from 'eth-ens-namehash';
import liveServer from 'live-server';
import chokidar from 'chokidar';

import { task, internalTask } from '@nomiclabs/buidler/config';
import { BuidlerRuntimeEnvironment } from '@nomiclabs/buidler/types';
import {
  TASK_START_WATCH_FRONTEND,
  TASK_FLATTEN_GET_FLATTENED_SOURCE
} from './task-names';

const manifestPath = 'manifest.json';
const artifactPath = 'artifact.json';
const arappPath = 'arapp.json';
const codePath = 'code.sol';

// internalTask(TASK_START_WATCH_FRONTEND, watchContracts);

/**
 * Main, composite, task.
 */
task('start-frontend', 'Starts Aragon app development').setAction(
  async ({}, { run }: BuidlerRuntimeEnvironment) => {
    console.log(`Starting...`);

    const frontEndSrc = path.resolve('app');
    const appDist = path.resolve('dist');

    async function buildRelease() {
      // Copy artifacts
      for (const filePath of [manifestPath, artifactPath, arappPath]) {
        await fsExtra.copy(filePath, path.join(appDist, filePath));
      }
      // Flatten contracts
      const contractSource = await run(TASK_FLATTEN_GET_FLATTENED_SOURCE);
      fs.writeFileSync(codePath, contractSource);
      // Build and copy front-end
      await buildAppFrontEnd(frontEndSrc);
    }

    async function buildAppFrontEnd(frontEndSrc: string) {
      // Build and copy front-end
      await execaPipe('npm', ['run', 'build'], { cwd: frontEndSrc });
      await fsExtra.copy(path.join(frontEndSrc, 'build'), appDist, {
        overwrite: true,
        preserveTimestamps: true
      });
    }

    // Initial release build
    await buildRelease();

    // Start a live-server for the Aragon App assets
    liveServer.start({
      port: 8181, // Set the server port. Defaults to 8080.
      host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
      root: appDist, // Set root directory that's being served. Defaults to cwd.
      open: false, // When false, it won't load your browser by default.
      ignore: 'build', // comma-separated string for paths to ignore
      file: 'index.html', // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
      wait: 1000 // Waits for all changes, before reloading. Defaults to 0 sec.
    });

    // Watch front-end files
    chokidar
      .watch(frontEndSrc, {
        ignored: /build/ // ignore dotfiles
      })
      .on('all', async (event, path) => {
        console.log(`Triggering build for ${path}`);
        await buildAppFrontEnd(frontEndSrc);
      });

    // Unresolving promise to keep task open.
    return new Promise((resolve, reject) => {});
  }
);

/*
 * Utils
 */

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
