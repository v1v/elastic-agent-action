import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as installer from './installer';
import os from 'os';

export async function install(version: string): Promise<string> {
  const installDir = await installer.getElasticAgent(version);
  return installDir;
}

export async function enroll(installDir: string, fleetUrl: string, enrollmentToken: string): Promise<void> {
  // TODO: windows
  const loginArgs: Array<string> = ['./elastic-agent'];
  loginArgs.push('--non-interactive');
  loginArgs.push('--url', fleetUrl);
  loginArgs.push('--enrollment-token', enrollmentToken);
  loginArgs.push('--tag', 'github-actions'); // TODO: add more tags

  core.info(`Enrolling into Fleet...`);

  await exec
    .getExecOutput('sudo', loginArgs, {
      ignoreReturnCode: true,
      silent: true,
      input: Buffer.from(enrollmentToken) // TODO: exclude fleetUrl
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr.trim());
      }
      core.info(`Enrollment Succeeded!`);
    });
}

export async function unenroll(installDir: string): Promise<void> {
  if (!installDir) {
    throw new Error('installDir required');
  }
  const command = 'sudo';
  const unenrollArgs: Array<string> = [];
  switch (os.platform()) {
    case 'darwin':
      unenrollArgs.push('launchctl', 'unload', '/Library/LaunchDaemons/co.elastic.elastic-agent.plist');
      break;
    case 'linux':
      unenrollArgs.push('service', 'elastic-agent', 'stop');
      break;
      // TODO: windows
  }
  await exec
    .getExecOutput(command, unenrollArgs, {
      ignoreReturnCode: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        core.warning(res.stderr.trim());
      }
    });
}
