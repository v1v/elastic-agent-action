import * as github from '@actions/github';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as installer from './installer';
import * as path from 'path';
import os from 'os';

export async function install(version: string): Promise<string> {
  const installDir = await installer.getElasticAgent(version);
  return installDir;
}

export async function enroll(
  installDir: string,
  fleetUrl: string,
  enrollmentToken: string,
  agentName: string
): Promise<void> {
  let previousName = null;

  // Set Elastic Agent name if required
  if (agentName.length !== 0) {
    previousName = await getHostname();
    await setHostname(agentName);
  }

  // Enroll the Elastic Agent
  await enrollOnly(installDir, fleetUrl, enrollmentToken);

  // Revert Elastic Agent name if hostname
  if (previousName) {
    await setHostname(previousName);
  }
}

export async function enrollOnly(installDir: string, fleetUrl: string, enrollmentToken: string): Promise<void> {
  let command = 'sudo';
  const enrollArgs: Array<string> = [];
  switch (os.platform()) {
    case 'win32':
      // path.join with windows separator if possible
      command = `${installDir}\\elastic-agent.exe`;
      break;
    default:
      enrollArgs.push(path.join(installDir, 'elastic-agent'));
      break;
  }

  enrollArgs.push('install');
  enrollArgs.push('--non-interactive');
  enrollArgs.push('--url', fleetUrl);
  enrollArgs.push('--enrollment-token', enrollmentToken);
  enrollArgs.push('--tag', 'github-actions'); // TODO: add more tags

  core.info(`Enrolling into Fleet...`);
  await exec
    .getExecOutput(command, enrollArgs, {
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

export async function unenroll(): Promise<void> {
  let command = 'sudo';
  const unenrollArgs: Array<string> = [];
  switch (os.platform()) {
    case 'darwin':
      unenrollArgs.push('launchctl', 'unload', '/Library/LaunchDaemons/co.elastic.elastic-agent.plist');
      break;
    case 'linux':
      unenrollArgs.push('service', 'elastic-agent', 'stop');
      break;
    case 'win32':
      // Stop-Service is not found in the windows context
      // use net stop instead
      command = 'net';
      unenrollArgs.push('stop', 'Elastic Agent');
      break;
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

export function getDefaultElasticAgentName(): string {
  // default repoName_jobName_runId
  const githubJobName = github.context.job;
  const githubRunId = github.context.runId;
  const repoName = github.context.repo.repo;
  return `${repoName}_${githubJobName}_${githubRunId}`;
}

export async function getHostname(): Promise<string> {
  let command = 'hostname';

  core.info(`Setting Elastic Agent name...`);
  await exec
    .getExecOutput(command, [], {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr.trim());
      }
      core.info(`Elastic Agent name retrieved!`);
      return res.stdout;
    });
  return '';
}

export async function setHostname(name: string): Promise<void> {
  let command = 'sudo';
  const enrollArgs: Array<string> = [];
  switch (os.platform()) {
    case 'win32':
      command = 'wmic';
      enrollArgs.push('computersystem', 'where', 'name="%computername%"');
      enrollArgs.push('call', 'rename', `name="${name}"`);
      break;
    case 'linux':
      enrollArgs.push('hostname');
      enrollArgs.push(name);
      break;
    default:
      enrollArgs.push('scutil');
      enrollArgs.push('--set', 'HostName');
      enrollArgs.push(name);
      break;
  }

  core.info(`Setting Elastic Agent name...`);
  await exec
    .getExecOutput(command, enrollArgs, {
      ignoreReturnCode: true,
      silent: true,
      input: Buffer.from(name)
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr.trim());
      }
      core.info(`Elastic Agent name ${name} changed!`);
    });
}
