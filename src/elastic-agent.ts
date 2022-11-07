import * as github from '@actions/github';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
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
  // default runId_runNumber
  const githubRunNumber = github.context.runNumber;
  const githubRunId = github.context.runId;
  return `${githubRunId}.${githubRunNumber}`;
}

export async function getHostname(): Promise<string> {
  const command = 'hostname';

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
      // see https://gist.github.com/timnew/2373475
      command = (await io.which('pwsh', false)) || (await io.which('powershell', true));
      enrollArgs.push('Remove-ItemProperty', '-path', '"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters"', '-name', '"Hostname"');
      enrollArgs.push('Remove-ItemProperty', '-path', '"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters"', '-name', '"NV Hostname"');
      enrollArgs.push('Set-ItemProperty', '-path', '"HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Computername\\Computername"', '-name', '"Computername"', '-value', name);
      enrollArgs.push('Set-ItemProperty', '-path', '"HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Computername\\ActiveComputername"', '-name', '"Computername"', '-value', name);
      enrollArgs.push('Set-ItemProperty', '-path', '"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters"', '-name', '"Hostname"', '-value', name);
      enrollArgs.push('Set-ItemProperty', '-path', '"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters"', '-name', '"NV Hostname" -value', name);
      enrollArgs.push('Set-ItemProperty', '-path', '"HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon"', '-name', '"AltDefaultDomainName"', '-value', name);
      enrollArgs.push('Set-ItemProperty', '-path', '"HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon"', '-name', '"DefaultDomainName"', '-value', name);
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

  core.info(`Setting Hostname '${name}'...`);
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
