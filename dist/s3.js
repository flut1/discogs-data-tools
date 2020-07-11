var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from "node-fetch";
import { groupBy, keyBy, mapValues } from "lodash-es";
import idx from "idx";
import xml2js from "xml2js";
import { BUCKET_URL, S3B_ROOT_DIR } from "./constants";
export function createS3QueryUrl(prefix = S3B_ROOT_DIR, marker) {
    let s3RestUrl = BUCKET_URL;
    s3RestUrl += "?delimiter=/";
    if (prefix) {
        s3RestUrl += `&prefix=${prefix.replace(/\/$/, "")}/`;
    }
    if (marker) {
        s3RestUrl += `&marker=${marker}`;
    }
    return s3RestUrl;
}
export function requestListing(yearPrefix) {
    return __awaiter(this, void 0, void 0, function* () {
        const s3QueryUrl = createS3QueryUrl(yearPrefix);
        let directoryResponse;
        try {
            const resp = yield fetch(s3QueryUrl);
            directoryResponse = yield resp.text();
        }
        catch (e) {
            throw new Error(`Failed to request ${s3QueryUrl}:\n${e}`);
        }
        let parsed;
        try {
            parsed = yield xml2js.parseStringPromise(directoryResponse);
        }
        catch (e) {
            throw new Error(`Error parsing directory XML: ${e}`);
        }
        return parsed;
    });
}
/**
 * Fetch a set of years available on the Discogs data S3 bucket with their
 * paths on the bucket.
 * @returns {Promise<Array<{path:string, year:number}>>}
 */
export function fetchYearListings() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Fetching year listings...");
        const parsed = yield requestListing();
        const prefixes = idx(parsed, (_) => _.ListBucketResult.CommonPrefixes);
        if (!prefixes) {
            throw new Error("Could not find prefixes on S3 directory listings");
        }
        const years = prefixes.map(({ Prefix: [Prefix] }) => ({
            path: Prefix,
            year: parseInt(Prefix.replace(/^data\//, "").replace(/\/$/, ""), 10),
        }));
        years.sort((a, b) => b.year - a.year);
        return years;
    });
}
/**
 * Fetch the list of files available on the S3 bucket for a certain year
 * @param yearPrefix {string} The year prefix of the file. For example:
 * "data/2016/"
 * @returns {Promise<Array<string>>} An array of paths
 */
export function fetchFileListing(yearPrefix) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Fetching file listings...");
        const parsed = yield requestListing(yearPrefix);
        const files = idx(parsed, (_) => _.ListBucketResult.Contents);
        if (!files) {
            throw new Error("Could not find files on S3 listings");
        }
        return files
            .map(({ Key: [key] }) => key)
            .filter((f) => f.endsWith(".xml.gz"));
    });
}
/**
 * Parse a list of file paths (as returned by fetchFileListing). Groups them
 * by year
 * @param filenames
 * @returns An object with keys for each year and an array of parsed
 * path objects as values.
 */
export function parseFileNames(filenames) {
    const parsed = filenames.map((path) => {
        const match = path.match(/discogs_([\d]+)_([^.]+)\.xml/);
        if (!match) {
            throw new Error("Unable to parse filenames from S3 listing");
        }
        return {
            url: `${BUCKET_URL}/${path}`,
            path,
            year: parseInt(match[1], 10),
            type: match[2],
        };
    });
    return mapValues(groupBy(parsed, (_) => _.year), (r) => keyBy(r, (_) => _.type));
}
