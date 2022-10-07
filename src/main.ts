import * as core from '@actions/core';
import * as context from './context';
import * as elasticAgent from './elastic-agent';
import * as stateHelper from './state-helper';

export async function run(): Promise<void> {
  try {
    // Save context
    const input: context.Inputs = context.getInputs();
    stateHelper.setFleetUrl(input.fleetUrl);
    stateHelper.setLogout(input.logout);

    // Install Elastic Agent
    const installDir = await elasticAgent.install(input.version);
    stateHelper.setInstallDir(installDir);

    // Enroll the runner
    await elasticAgent.enroll(installDir, input.fleetUrl, input.enrollmentToken);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function logout(): Promise<void> {
  if (!stateHelper.logout) {
    return;
  }
  await elasticAgent.unenroll(stateHelper.installDir);
}

if (!stateHelper.IsPost) {
  run();
} else {
  logout();
}
