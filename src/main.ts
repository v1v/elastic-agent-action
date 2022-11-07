import * as core from '@actions/core';
import * as context from './context';
import * as elasticAgent from './elastic-agent';
import * as stateHelper from './state-helper';
import * as semver from 'semver';

export async function run(): Promise<void> {
  try {
    // Save context
    const input: context.Inputs = context.getInputs();
    stateHelper.setFleetUrl(input.fleetUrl);
    stateHelper.setLogout(input.logout);

    // Validate action inputs
    if (input.version.length === 0) {
      throw new Error('version cannot be empty');
    }
    if (!input.enrollmentToken) {
      throw new Error('enrollmentToken required');
    }
    if (!input.fleetUrl) {
      throw new Error('fleetUrl required');
    }

    // Install Elastic Agent
    const installDir = await elasticAgent.install(input.version);
    stateHelper.setInstallDir(installDir);

    // Gather tags
    // TODO: gather tags based on the OS
    const tags = semver.gte(input.version, '8.3.0') ? ',foo' : '';

    // Enroll the runner
    await elasticAgent.enroll(installDir, input.fleetUrl, input.enrollmentToken, tags);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function logout(): Promise<void> {
  if (!stateHelper.logout) {
    return;
  }
  await elasticAgent.unenroll();
}

if (!stateHelper.IsPost) {
  run();
} else {
  logout();
}
