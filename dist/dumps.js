var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BUCKET_URL } from "./constants";
import { fetchFileListing, fetchYearListings, parseFileNames } from "./s3";
/**
 * Get the URL for a checksum file of the specified version
 * @param version {string} The exact version name, eg '20180101'
 * @returns {string}
 */
export function getChecksumURL(version) {
    return `${BUCKET_URL}/data/${version.substring(0, 4)}/discogs_${version}_CHECKSUM.txt`;
}
/**
 * Get the URL for a specific data dump
 * @param version {string} The exact version name, eg '20180101'
 * @param collection {string} The type of data. Can be either "artists", "labels",
 * "masters" or "releases"
 * @returns {string}
 */
export function getDumpURL(version, collection) {
    return `${BUCKET_URL}/data/${version.substring(0, 4)}/discogs_${version}_${collection}.xml.gz`;
}
/**
 * Gets the name of the latest version available in the S3 bucket
 * @returns {Promise<string>} A promise that resolves with the version name
 */
export function getLatestVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const years = yield fetchYearListings();
        const files = yield fetchFileListing(years[0].path);
        const versions = parseFileNames(files);
        const versionNames = Object.keys(versions).map((v) => parseInt(v, 10));
        versionNames.sort((a, b) => b - a);
        return versionNames[0].toString();
    });
}
