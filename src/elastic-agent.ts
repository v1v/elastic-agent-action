import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as installer from './installer';
import * as path from 'path';
import os from 'os';

export async function install(version: string): Promise<string> {
  const installDir = await installer.getElasticAgent(version);
  return installDir;
}

export async function enroll(installDir: string, fleetUrl: string, enrollmentToken: string): Promise<void> {
  // TODO: windows
  const enrollArgs: Array<string> = [path.join(installDir, './elastic-agent')];
  enrollArgs.push('install');
  enrollArgs.push('--non-interactive');
  enrollArgs.push('--url', fleetUrl);
  enrollArgs.push('--enrollment-token', enrollmentToken);
  enrollArgs.push('--tag', 'github-actions'); // TODO: add more tags

  core.info(`Enrolling into Fleet...`);

  await exec
    .getExecOutput('sudo', enrollArgs, {
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
