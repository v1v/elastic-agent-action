import * as core from '@actions/core';

export const IsPost = !!process.env['STATE_isPost'];
export const fleetUrl = process.env['STATE_fleetUrl'] || '';
export const installDir = process.env['STATE_installDir'] || '';
export const logout = /true/i.test(process.env['STATE_logout'] || '');

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
