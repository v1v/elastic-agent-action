import * as core from '@actions/core';

export interface Inputs {
  fleetUrl: string;
  enrollmentToken: string;
  version: string;
  name: string;
  logout: boolean;
}

export function getInputs(): Inputs {
  return {
    fleetUrl: core.getInput('fleetUrl'),
    version: core.getInput('version'),
    enrollmentToken: core.getInput('enrollmentToken'),
    name: core.getInput('logout'),
    logout: core.getBooleanInput('logout')
  };
}
