import {expect, jest, test} from '@jest/globals';
import {enroll, unenroll} from '../src/elastic-agent';
import * as path from 'path';
import * as exec from '@actions/exec';
import osm = require('os');

process.env['RUNNER_TEMP'] = path.join(__dirname, 'runner');

test('enroll calls exec Linux', async () => {
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
  const token = 'my-token';
  const fleetUrl = 'https://my-fleet';

  await enroll('/tmp', fleetUrl, token);
  expect(execSpy).toHaveBeenCalledWith(
    `sudo`,
    [
      '/tmp/elastic-agent',
      'install',
      '--non-interactive',
      '--url',
      fleetUrl,
      '--enrollment-token',
      token,
      '--tag',
      'github-actions'
    ],
    {
      input: Buffer.from(token),
      silent: true,
      ignoreReturnCode: true
    }
  );
});

test('enroll calls exec MacOS', async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const execSpy = jest.spyOn(exec, 'getExecOutput').mockImplementation(async () => {
    return {
      exitCode: expect.any(Number),
      stdout: expect.any(Function),
      stderr: expect.any(Function)
    };
  });

  jest.spyOn(osm, 'platform').mockImplementation(() => 'darwin');

  const token = 'my-token';
  const fleetUrl = 'https://my-fleet';

  await enroll('/tmp', fleetUrl, token);
  expect(execSpy).toHaveBeenCalledWith(
    `sudo`,
    [
      '/tmp/elastic-agent',
      'install',
      '--non-interactive',
      '--url',
      fleetUrl,
      '--enrollment-token',
      token,
      '--tag',
      'github-actions'
    ],
    {
      input: Buffer.from(token),
      silent: true,
      ignoreReturnCode: true
    }
  );
});

test('enroll calls exec Windows', async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const execSpy = jest.spyOn(exec, 'getExecOutput').mockImplementation(async () => {
    return {
      exitCode: expect.any(Number),
      stdout: expect.any(Function),
      stderr: expect.any(Function)
    };
  });

  jest.spyOn(osm, 'platform').mockImplementation(() => 'win32');
  const token = 'my-token';
  const fleetUrl = 'https://my-fleet';

  await enroll('c:\\temp', fleetUrl, token);
  expect(execSpy).toHaveBeenCalledWith(
    'c:\\temp\\elastic-agent.exe',
    ['install', '--non-interactive', '--url', fleetUrl, '--enrollment-token', token, '--tag', 'github-actions'],
    {
      input: Buffer.from(token),
      silent: true,
      ignoreReturnCode: true
    }
  );
});

test('unenroll calls exec Linux', async () => {
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
});

test('unenroll calls exec MacOS', async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const execSpy = jest.spyOn(exec, 'getExecOutput').mockImplementation(async () => {
    return {
      exitCode: expect.any(Number),
      stdout: expect.any(Function),
      stderr: expect.any(Function)
    };
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

test('unenroll calls exec Windows', async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const execSpy = jest.spyOn(exec, 'getExecOutput').mockImplementation(async () => {
    return {
      exitCode: expect.any(Number),
      stdout: expect.any(Function),
      stderr: expect.any(Function)
    };
  });

  jest.spyOn(osm, 'platform').mockImplementation(() => 'win32');
  await unenroll('c:\\tmp');
  expect(execSpy).toHaveBeenCalledWith('Stop-Service', ['Elastic', 'Agent'], {
    ignoreReturnCode: true
  });
});
