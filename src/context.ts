import * as core from '@actions/core';

export interface Inputs {
  fleetUrl: string;
  enrollmentToken: string;
  version: string;
  logout: boolean;
}

export function getInputs(): Inputs {
  return {
    fleetUrl: core.getInput('fleetUrl'),
    version: core.getInput('version'),
    enrollmentToken: core.getInput('enrollmentToken'),
    logout: core.getBooleanInput('logout')
  };
}
