import * as core from '@actions/core';

export const IsPost = !!core.getState('isPost');
export const fleetUrl = core.getState('fleetUrl');
export const installDir = core.getState('installDir');
export const logout = /true/i.test(core.getState('logout'));

export function setInstallDir(installDir: string) {
  core.saveState('installDir', installDir);
}

export function setFleetUrl(fleetUrl: string) {
  core.saveState('fleetUrl', fleetUrl);
}

export function setLogout(logout: boolean) {
  core.saveState('logout', logout);
}

if (!IsPost) {
  core.saveState('isPost', 'true');
}
