import * as tc from '@actions/tool-cache';
import * as core from '@actions/core';
import * as path from 'path';
import os from 'os';
import fs from 'fs';

export interface IElasticAgentVersionInfo {
  downloadUrl: string;
  version: string;
  fileName: string;
  folderName: string;
}

export async function getElasticAgent(version: string, arch = os.arch()) {
  const osPlat: string = os.platform();

  core.info(`Attempting to download ${version}...`);
  let downloadPath = '';
  let info: IElasticAgentVersionInfo | null = null;

  //
  // Download from artifacts.elastic.co
  //
  info = await getInfo(version, arch);
  // Search for latest if that's supported in the future
  if (!info) {
    throw new Error(
      `Unable to find Elastic Agent version '${version}' for platform ${osPlat} and architecture ${arch}.`
    );
  }

  try {
    downloadPath = await installElasticAgentVersion(info);
  } catch (err) {
    throw new Error(`Failed to download version ${version}: ${err}`);
  }

  return downloadPath;
}

async function getInfo(version: string, arch: string): Promise<IElasticAgentVersionInfo | null> {
  const platform = getPlatform();
  const architecture = getArch(arch, platform);
  const isWindows = os.platform() === 'win32';
  const folderName = `elastic-agent-${version}-${platform}-${architecture}`;
  const fileName = isWindows ? `${folderName}.zip` : `${folderName}.tar.gz`;
  const downloadUrl = `https://artifacts.elastic.co/downloads/beats/elastic-agent/${fileName}`;

  return <IElasticAgentVersionInfo>{
    downloadUrl: downloadUrl,
    version: version,
    fileName: fileName,
    folderName: folderName
  };
}

async function installElasticAgentVersion(info: IElasticAgentVersionInfo): Promise<string> {
  core.info(`Acquiring ${info.version} from ${info.downloadUrl}`);

  // Windows requires that we keep the extension (.zip) for extraction
  const isWindows = os.platform() === 'win32';
  const tempDir = process.env.RUNNER_TEMP || '.';
  const fileName = isWindows ? path.join(tempDir, info.fileName) : undefined;

  const downloadPath = await tc.downloadTool(info.downloadUrl, fileName);

  core.info('Extracting ElasticAgent...');
  const extPath = await extractElasticAgentArchive(downloadPath);
  core.info(`Successfully extracted ElasticAgent to ${extPath}`);

  // Installation path requires to append the folder name.
  const extPathWithFolderName = path.join(extPath, info.folderName);
  if (core.isDebug()) {
    core.info(`Listing content for ${extPathWithFolderName}`);
    fs.readdirSync(extPathWithFolderName).forEach(file => {
      core.debug(`- ${file}`);
    });
  }

  return extPathWithFolderName;
}

export async function extractElasticAgentArchive(archivePath: string): Promise<string> {
  const platform = os.platform();
  let extPath: string;

  if (platform === 'win32') {
    extPath = await tc.extractZip(archivePath);
  } else {
    extPath = await tc.extractTar(archivePath);
  }

  return extPath;
}

export function getPlatform(): string {
  // 'aix', 'darwin', 'freebsd', 'linux', 'openbsd', 'sunos', and 'win32'
  let plat: string = os.platform();

  // darwin and linux match already
  // wants 'darwin', 'freebsd', 'linux', 'windows'
  if (plat === 'win32') {
    plat = 'windows';
  }

  return plat;
}

export function getArch(arch: string, plat: string): string {
  // 'arm', 'arm64', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'.
  switch (arch) {
    case 'x64':
      arch = 'x86_64';
      break;
    case 'arm64':
      if (plat === 'darwin') {
        arch = 'aarch64';
      }
      break;
    default:
      arch = '';
      break;
  }

  return arch;
}
