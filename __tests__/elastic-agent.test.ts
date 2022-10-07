import {expect, jest, test} from '@jest/globals';
import {enroll, unenroll} from '../src/elastic-agent';
import * as path from 'path';
import * as exec from '@actions/exec';
import osm = require('os');

process.env['RUNNER_TEMP'] = path.join(__dirname, 'runner');

test('enroll calls exec Linux/MacOS', async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const execSpy = jest.spyOn(exec, 'getExecOutput').mockImplementation(async () => {
    return {
      exitCode: expect.any(Number),
      stdout: expect.any(Function),
      stderr: expect.any(Function)
    };
  });

  const token = 'my-token';
  const fleetUrl = 'https://my-fleet';

  jest.spyOn(osm, 'platform').mockImplementation(() => 'linux');
  await enroll('/tmp', fleetUrl, token);
  expect(execSpy).toHaveBeenCalledWith(
    `sudo`,
    ['./elastic-agent', '--non-interactive', '--url', fleetUrl, '--enrollment-token', token, '--tag', 'github-actions'],
    {
      input: Buffer.from(token),
      silent: true,
      ignoreReturnCode: true
    }
  );

  jest.spyOn(osm, 'platform').mockImplementation(() => 'darwin');
  await enroll('/tmp', fleetUrl, token);
  expect(execSpy).toHaveBeenCalledWith(
    `sudo`,
    ['./elastic-agent', '--non-interactive', '--url', fleetUrl, '--enrollment-token', token, '--tag', 'github-actions'],
    {
      input: Buffer.from(token),
      silent: true,
      ignoreReturnCode: true
    }
  );
});

test('unenroll calls exec Linux/MacOS', async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const execSpy = jest.spyOn(exec, 'getExecOutput').mockImplementation(async () => {
    return {
      exitCode: expect.any(Number),
      stdout: expect.any(Function),
      stderr: expect.any(Function)
    };
  });

  jest.spyOn(osm, 'platform').mockImplementation(() => 'linux');
  await unenroll('/tmp');
  expect(execSpy).toHaveBeenCalledWith(`sudo`, ['service', 'elastic-agent', 'stop'], {
    ignoreReturnCode: true
  });

  jest.spyOn(osm, 'platform').mockImplementation(() => 'darwin');
  await unenroll('/tmp');
  expect(execSpy).toHaveBeenCalledWith(
    `sudo`,
    ['launchctl', 'unload', '/Library/LaunchDaemons/co.elastic.elastic-agent.plist'],
    {
      ignoreReturnCode: true
    }
  );
});
