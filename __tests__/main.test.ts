import {expect, jest, test} from '@jest/globals';
import osm = require('os');

import {run} from '../src/main';
import * as elasticAgent from '../src/elastic-agent';
import * as stateHelper from '../src/state-helper';

import * as core from '@actions/core';

test('errors without fleetUrl and enrollmentToken', async () => {
  jest.spyOn(osm, 'platform').mockImplementation(() => 'linux');
  process.env['INPUT_LOGOUT'] = 'true'; // default value
  const coreSpy = jest.spyOn(core, 'setFailed');

  await run();
  expect(coreSpy).toHaveBeenCalledWith('enrollmentToken required');
});

test('successful with fleetUrl and enrollmentToken', async () => {
  jest.spyOn(osm, 'platform').mockImplementation(() => 'linux');
  const setRegistrySpy = jest.spyOn(stateHelper, 'setFleetUrl');
  const setLogoutSpy = jest.spyOn(stateHelper, 'setLogout');
  const dockerSpy = jest.spyOn(elasticAgent, 'enroll').mockImplementation(jest.fn());

  const fleetUrl = 'dbowie';
  process.env[`INPUT_FLEET_URL`] = fleetUrl;

  const enrollmentToken = 'groundcontrol';
  process.env[`INPUT_ENROLLMENT_TOKEN`] = enrollmentToken;

  const logout = false;
  process.env['INPUT_LOGOUT'] = String(logout);

  await run();

  expect(setRegistrySpy).toHaveBeenCalledWith('');
  expect(setLogoutSpy).toHaveBeenCalledWith(logout);
  expect(dockerSpy).toHaveBeenCalledWith(fleetUrl, enrollmentToken);
});
