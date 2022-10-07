import {expect, jest, test} from '@jest/globals';
import osm = require('os');

import {run} from '../src/main';
import * as elasticAgent from '../src/elastic-agent';
import * as stateHelper from '../src/state-helper';

import * as core from '@actions/core';

test('errors without version', async () => {
  jest.spyOn(osm, 'platform').mockImplementation(() => 'linux');
  process.env['INPUT_LOGOUT'] = 'true'; // default value
  const coreSpy = jest.spyOn(core, 'setFailed');

  await run();
  expect(coreSpy).toHaveBeenCalledWith('version required');
});

test('errors without enrollmentToken', async () => {
  jest.spyOn(osm, 'platform').mockImplementation(() => 'linux');
  process.env['INPUT_LOGOUT'] = 'true'; // default value
  const coreSpy = jest.spyOn(core, 'setFailed');

  const version = '8.4.3';
  process.env[`INPUT_VERSION`] = version;

  await run();
  expect(coreSpy).toHaveBeenCalledWith('enrollmentToken required');
});
