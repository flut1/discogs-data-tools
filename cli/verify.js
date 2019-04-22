import { verify } from "../verify";
import { findData } from "../dataManager";
import getVersionFromArgv from "./getVersionFromArgv";
import { COLLECTIONS } from "../constants";

export default async function verifyCli(argv) {
  const collections = argv.collections || COLLECTIONS;
  const version = await getVersionFromArgv(argv);
  const dumpFiles = findData(version, collections, argv["data-dir"]);

  for (let i = 0; i < dumpFiles.length; i++) {
    if (!dumpFiles[i]) {
      console.error(`No dump file found for ${version} ${collections[i]}`);
      return;
    }
  }

  verify(version, collections, argv["data-dir"]).catch(e => console.error(e));
}
