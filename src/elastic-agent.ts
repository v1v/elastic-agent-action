import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function enroll(fleetUrl: string, enrollmentToken: string): Promise<void> {
  await loginStandard(fleetUrl, enrollmentToken);
}

export async function unenroll(fleetUrl: string): Promise<void> {
  await exec
    .getExecOutput('docker', ['logout', fleetUrl], {
      ignoreReturnCode: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        core.warning(res.stderr.trim());
      }
    });
}

export async function loginStandard(fleetUrl: string, enrollmentToken: string): Promise<void> {
  if (!enrollmentToken) {
    throw new Error('enrollmentToken required');
  }

  const loginArgs: Array<string> = ['login', '--password-stdin'];
  loginArgs.push('--username', enrollmentToken);
  loginArgs.push(fleetUrl);

  core.info(`Logging into Fleet...`);

  await exec
    .getExecOutput('docker', loginArgs, {
      ignoreReturnCode: true,
      silent: true,
      input: Buffer.from(enrollmentToken)
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr.trim());
      }
      core.info(`Enrollment Succeeded!`);
    });
}

