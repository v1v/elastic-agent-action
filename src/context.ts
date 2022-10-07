import * as core from '@actions/core';

export interface Inputs {
  fleetUrl: string;
  enrollmentToken: string;
  logout: boolean;
}

export function getInputs(): Inputs {
  return {
    fleetUrl: core.getInput('fleetUrl'),
    enrollmentToken: core.getInput('enrollmentToken'),
    logout: core.getBooleanInput('logout')
  };
}
