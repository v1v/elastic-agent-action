import {expect, jest, test} from '@jest/globals';
import * as core from '@actions/core';
import osm = require('os');
import {run} from '../src/main';

test('errors with empty version', async () => {
  jest.spyOn(osm, 'platform').mockImplementation(() => 'linux');
  process.env['INPUT_LOGOUT'] = 'true'; // default value
  process.env['INPUT_VERSION'] = '';
  const coreSpy = jest.spyOn(core, 'setFailed');

  await run();
  expect(coreSpy).toHaveBeenCalledWith('version cannot be empty');
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
