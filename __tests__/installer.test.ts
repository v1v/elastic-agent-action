import {expect, jest, test} from '@jest/globals';
import {getPlatform, getArch, extractElasticAgentArchive} from '../src/installer';
import * as tc from '@actions/tool-cache';
import osm = require('os');

test('getPlatform with win32 returns windows', async () => {
  jest.spyOn(osm, 'platform').mockImplementation(() => 'win32');
  const value = getPlatform();
  expect(value).toBe('windows');
});

test('getPlatform with win32 returns linux', async () => {
  jest.spyOn(osm, 'platform').mockImplementation(() => 'linux');
  const value = getPlatform();
  expect(value).toBe('linux');
});

test('getArch with x64 returns x86_64', async () => {
  const value = getArch('x64', 'linux');
  expect(value).toBe('x86_64');
});

test('getArch with arm64 and linux returns arm64', async () => {
  const value = getArch('arm64', 'linux');
  expect(value).toBe('arm64');
});

test('getArch with arm64 and darwin returns arm64', async () => {
  const value = getArch('arm64', 'darwin');
  expect(value).toBe('aarch64');
});

test('getArch with unsupported arch returns empty', async () => {
  const value = getArch('arm', '');
  expect(value).toBe('');
});

test('extractElasticAgentArchive on linux', async () => {
  jest.spyOn(osm, 'platform').mockImplementation(() => 'linux');

  const extractTarSpy = jest.spyOn(tc, 'extractTar');
  extractTarSpy.mockImplementation(async () => '/tmp');
  extractElasticAgentArchive('/tmp');

  expect(extractTarSpy).toHaveBeenCalled();
});

test('extractElasticAgentArchive on win32', async () => {
  jest.spyOn(osm, 'platform').mockImplementation(() => 'win32');

  const extractZipSpy = jest.spyOn(tc, 'extractZip');
  extractZipSpy.mockImplementation(async () => 'c:\\tmp');
  extractElasticAgentArchive('c:\\tmp');

  expect(extractZipSpy).toHaveBeenCalled();
});
