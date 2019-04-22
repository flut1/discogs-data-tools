import path from 'path';
import sumchecker from 'sumchecker';
import { ensureChecksum } from './fetcher';
import { COLLECTIONS } from './constants';

export async function verify(version, collections = COLLECTIONS, dataDir) {
  const checksumPath = await ensureChecksum(version, dataDir);

  console.log("Verifying with checksum...");
  await sumchecker(
    "sha256",
    checksumPath,
    path.resolve(dataDir, version),
    collections.map(collection => `discogs_${version}_${collection}.xml.gz`)
  );
  console.log("All ok!");
}
