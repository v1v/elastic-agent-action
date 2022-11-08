import {expect, jest, test} from '@jest/globals';
import {enrollOnly, unenroll} from '../src/elastic-agent';
import * as path from 'path';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
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
  jest.spyOn(osm, 'arch').mockImplementation(() => 'x64');

  // Mock github context
  jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
    return {
      owner: 'some-owner',
      repo: 'some-repo'
    };
  });

  const token = 'my-token';
  const fleetUrl = 'https://my-fleet';

  await enrollOnly('/tmp', fleetUrl, token, '8.3.1');
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
      'github-actions,some-repo,linux,x64'
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
  jest.spyOn(osm, 'arch').mockImplementation(() => 'x64');

  // Mock github context
  jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
    return {
      owner: 'some-owner',
      repo: 'some-repo'
    };
  });

  const token = 'my-token';
  const fleetUrl = 'https://my-fleet';

  await enrollOnly('/tmp', fleetUrl, token, '8.3.1');
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
      'github-actions,some-repo,darwin,x64'
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
  jest.spyOn(osm, 'arch').mockImplementation(() => 'x64');

  // Mock github context
  jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
    return {
      owner: 'some-owner',
      repo: 'some-repo'
    };
  });

  const token = 'my-token';
  const fleetUrl = 'https://my-fleet';

  await enrollOnly('c:\\temp', fleetUrl, token, '8.3.1');
  expect(execSpy).toHaveBeenCalledWith(
    'c:\\temp\\elastic-agent.exe',
    [
      'install',
      '--non-interactive',
      '--url',
      fleetUrl,
      '--enrollment-token',
      token,
      '--tag',
      'github-actions,some-repo,win32,x64'
    ],
    {
      input: Buffer.from(token),
      silent: true,
      ignoreReturnCode: true
    }
  );
});

test('enrollOnly calls exec Linux with version lt 8.3.0', async () => {
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
  jest.spyOn(osm, 'arch').mockImplementation(() => 'x64');
  const token = 'my-token';
  const fleetUrl = 'https://my-fleet';

  await enrollOnly('/tmp', fleetUrl, token, '8.2.0');
  expect(execSpy).toHaveBeenCalledWith(
    `sudo`,
    ['/tmp/elastic-agent', 'install', '--non-interactive', '--url', fleetUrl, '--enrollment-token', token],
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
