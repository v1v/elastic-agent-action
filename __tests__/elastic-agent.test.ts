import {expect, jest, test} from '@jest/globals';
import {enrollOnly, unenroll} from '../src/elastic-agent';
import * as path from 'path';
import * as exec from '@actions/exec';
import osm = require('os');

process.env['RUNNER_TEMP'] = path.join(__dirname, 'runner');

test('enrollOnly calls exec Linux', async () => {
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

  await enrollOnly('/tmp', fleetUrl, token, '');
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

test('enrollOnly calls exec MacOS', async () => {
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

  await enrollOnly('/tmp', fleetUrl, token, ',foo');
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
      'github-actions,foo'
    ],
    {
      input: Buffer.from(token),
      silent: true,
      ignoreReturnCode: true
    }
  );
});

test('enrollOnly calls exec Windows', async () => {
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

  await enrollOnly('c:\\temp', fleetUrl, token, 'foo');
  expect(execSpy).toHaveBeenCalledWith(
    'c:\\temp\\elastic-agent.exe',
    ['install', '--non-interactive', '--url', fleetUrl, '--enrollment-token', token, '--tag', 'github-actions,foo'],
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
  await unenroll();
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
  await unenroll();
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
  await unenroll();
  expect(execSpy).toHaveBeenCalledWith('net', ['stop', 'Elastic Agent'], {
    ignoreReturnCode: true
  });
});
