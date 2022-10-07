import * as core from '@actions/core';
import * as context from './context';
import * as elasticAgent from './elastic-agent';
import * as stateHelper from './state-helper';

export async function run(): Promise<void> {
  try {
    const input: context.Inputs = context.getInputs();
    stateHelper.setFleetUrl(input.fleetUrl);
    stateHelper.setLogout(input.logout);
    await elasticAgent.enroll(input.fleetUrl, input.enrollmentToken, input.version);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function logout(): Promise<void> {
  if (!stateHelper.logout) {
    return;
  }
  await elasticAgent.unenroll(stateHelper.fleetUrl);
}

if (!stateHelper.IsPost) {
  run();
} else {
  logout();
}
