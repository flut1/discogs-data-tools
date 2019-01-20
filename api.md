## Modules

<dl>
<dt><a href="#module_fetcher">fetcher</a></dt>
<dd><p>Download data dumps and show download progress</p>
</dd>
<dt><a href="#module_localDumps">localDumps</a></dt>
<dd><p>Lookup data dump files that have already been downloaded</p>
</dd>
<dt><a href="#module_remoteDumps">remoteDumps</a></dt>
<dd><p>Lookup available data dumps on the S3 bucket</p>
</dd>
<dt><a href="#module_processing/dumpFormatter">processing/dumpFormatter</a></dt>
<dd><p>Helpers to transform on the dumps parsed by XMLParser into plain objects
that are easier to work with.</p>
</dd>
<dt><a href="#module_util/parseUtils">util/parseUtils</a></dt>
<dd><p>Small helpers for parsing discogs data</p>
</dd>
</dl>

<a name="module_fetcher"></a>

## fetcher
Download data dumps and show download progress


* [fetcher](#module_fetcher)
    * [~ensureDump(version, collection, [showProgress], [dataDir])](#module_fetcher..ensureDump) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~ensureDumps(version, [collections], [showProgress], [dataDir])](#module_fetcher..ensureDumps) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~ensureChecksum(version, [dataDir])](#module_fetcher..ensureChecksum) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="module_fetcher..ensureDump"></a>

### fetcher~ensureDump(version, collection, [showProgress], [dataDir]) ⇒ <code>Promise.&lt;void&gt;</code>
Ensures a data dump file is downloaded to ./data/<version>/. Doesnothing if a file already exists. Does not verify the file.

**Kind**: inner method of [<code>fetcher</code>](#module_fetcher)  
**Returns**: <code>Promise.&lt;void&gt;</code> - A Promise that completes when all data isdownloaded  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| collection | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [showProgress] | <code>boolean</code> | <code>false</code> | Show a progress indicator. For usage in an interactive CLI. On a server you probably want this set to false |
| [dataDir] | <code>string</code> |  | Set to overwrite the default data directory where dumps are stored (./data) |

<a name="module_fetcher..ensureDumps"></a>

### fetcher~ensureDumps(version, [collections], [showProgress], [dataDir]) ⇒ <code>Promise.&lt;void&gt;</code>
Ensures all the specified collections of a specific data dump version aredownloaded to the given data directory

**Kind**: inner method of [<code>fetcher</code>](#module_fetcher)  
**Returns**: <code>Promise.&lt;void&gt;</code> - A Promise that completes when all data isdownloaded  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| [collections] | <code>Array.&lt;string&gt;</code> |  | An array of types to get. Possible options: "artists", "labels", "masters" or "releases".  Defaults to all types |
| [showProgress] | <code>boolean</code> | <code>false</code> | Show a progress indicator. For usage in an interactive CLI. On a server you probably want this set to false |
| [dataDir] | <code>string</code> |  | Set to overwrite the default data directory where dumps are stored (./data) |

<a name="module_fetcher..ensureChecksum"></a>

### fetcher~ensureChecksum(version, [dataDir]) ⇒ <code>Promise.&lt;void&gt;</code>
Ensures that the CHECKSUM file for a given version is downloaded

**Kind**: inner method of [<code>fetcher</code>](#module_fetcher)  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| [dataDir] | <code>string</code> | Set to overwrite the default data directory where dumps are stored (./data) |

<a name="module_localDumps"></a>

## localDumps
Lookup data dump files that have already been downloaded


* [localDumps](#module_localDumps)
    * [~getXMLPath(version, collection, [gz], [dataDir])](#module_localDumps..getXMLPath) ⇒ <code>string</code>
    * [~getChecksumPath(version, [dataDir])](#module_localDumps..getChecksumPath) ⇒ <code>string</code>
    * [~findXML(version, collection, [gz], [dataDir])](#module_localDumps..findXML) ⇒ <code>Object</code> \| <code>null</code>
    * [~findData(version, collections, [dataDir])](#module_localDumps..findData) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>
    * [~globDumps([dataDir])](#module_localDumps..globDumps) ⇒ <code>Object</code>

<a name="module_localDumps..getXMLPath"></a>

### localDumps~getXMLPath(version, collection, [gz], [dataDir]) ⇒ <code>string</code>
Get the path where a data XML is saved

**Kind**: inner method of [<code>localDumps</code>](#module_localDumps)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| collection | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

<a name="module_localDumps..getChecksumPath"></a>

### localDumps~getChecksumPath(version, [dataDir]) ⇒ <code>string</code>
Get the path to where the checksum file for a specified version is stored

**Kind**: inner method of [<code>localDumps</code>](#module_localDumps)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

<a name="module_localDumps..findXML"></a>

### localDumps~findXML(version, collection, [gz], [dataDir]) ⇒ <code>Object</code> \| <code>null</code>
Looks up an existing data xml on disk

**Kind**: inner method of [<code>localDumps</code>](#module_localDumps)  
**Returns**: <code>Object</code> \| <code>null</code> - An object of the form `{ path: string, gz: boolean }`if the file was found, null otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| collection | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

<a name="module_localDumps..findData"></a>

### localDumps~findData(version, collections, [dataDir]) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>
Looks up the xml files on disk for a given version

**Kind**: inner method of [<code>localDumps</code>](#module_localDumps)  
**Returns**: <code>Array.&lt;(Object\|null)&gt;</code> - An array of results for each type:An object of the form `{ path: string, gz: boolean }` if the file was found,null otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| collections | <code>Array.&lt;string&gt;</code> |  | An array of types to get. Possible options: "artists", "labels", "masters" or "releases".  Defaults to all types |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

<a name="module_localDumps..globDumps"></a>

### localDumps~globDumps([dataDir]) ⇒ <code>Object</code>
List all data downloaded to the data directory

**Kind**: inner method of [<code>localDumps</code>](#module_localDumps)  
**Returns**: <code>Object</code> - A map containing all downloaded files  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

<a name="module_remoteDumps"></a>

## remoteDumps
Lookup available data dumps on the S3 bucket


* [remoteDumps](#module_remoteDumps)
    * [~getDumpURL(version, collection)](#module_remoteDumps..getDumpURL) ⇒ <code>string</code>
    * [~getChecksumURL(version)](#module_remoteDumps..getChecksumURL) ⇒ <code>string</code>
    * [~fetchYearListings()](#module_remoteDumps..fetchYearListings) ⇒ <code>Promise.&lt;Array.&lt;{path:string, year:number}&gt;&gt;</code>
    * [~fetchFileListing(yearPrefix)](#module_remoteDumps..fetchFileListing) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [~parseFileNames(filenames)](#module_remoteDumps..parseFileNames) ⇒ <code>Object</code>

<a name="module_remoteDumps..getDumpURL"></a>

### remoteDumps~getDumpURL(version, collection) ⇒ <code>string</code>
Get the URL for a specific data dump

**Kind**: inner method of [<code>remoteDumps</code>](#module_remoteDumps)  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| collection | <code>string</code> | The type of data. Can be either "artists", "labels", "masters" or "releases" |

<a name="module_remoteDumps..getChecksumURL"></a>

### remoteDumps~getChecksumURL(version) ⇒ <code>string</code>
Get the URL for a checksum file of the specified version

**Kind**: inner method of [<code>remoteDumps</code>](#module_remoteDumps)  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |

<a name="module_remoteDumps..fetchYearListings"></a>

### remoteDumps~fetchYearListings() ⇒ <code>Promise.&lt;Array.&lt;{path:string, year:number}&gt;&gt;</code>
Fetch a set of years available on the Discogs data S3 bucket with theirpaths on the bucket.

**Kind**: inner method of [<code>remoteDumps</code>](#module_remoteDumps)  
<a name="module_remoteDumps..fetchFileListing"></a>

### remoteDumps~fetchFileListing(yearPrefix) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Fetch the list of files available on the S3 bucket for a certain year

**Kind**: inner method of [<code>remoteDumps</code>](#module_remoteDumps)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - An array of paths  

| Param | Type | Description |
| --- | --- | --- |
| yearPrefix | <code>string</code> | The year prefix of the file. For example: "data/2016/" |

<a name="module_remoteDumps..parseFileNames"></a>

### remoteDumps~parseFileNames(filenames) ⇒ <code>Object</code>
Parse a list of file paths (as returned by fetchFileListing). Groups themby year

**Kind**: inner method of [<code>remoteDumps</code>](#module_remoteDumps)  
**Returns**: <code>Object</code> - An object with keys for each year and an array of parsedpath objects as values.  

| Param | Type |
| --- | --- |
| filenames | <code>Array.&lt;string&gt;</code> | 

<a name="module_processing/dumpFormatter"></a>

## processing/dumpFormatter
Helpers to transform on the dumps parsed by XMLParser into plain objectsthat are easier to work with.


* [processing/dumpFormatter](#module_processing/dumpFormatter)
    * [~formatLabel(label, [includeImageObjects])](#module_processing/dumpFormatter..formatLabel) ⇒ <code>object</code>
    * [~formatArtist(artist, [includeImageObjects])](#module_processing/dumpFormatter..formatArtist) ⇒ <code>object</code>
    * [~formatMaster(master, [includeImageObjects])](#module_processing/dumpFormatter..formatMaster) ⇒ <code>object</code>
    * [~formatRelease(release, [includeImageObjects])](#module_processing/dumpFormatter..formatRelease) ⇒ <code>object</code>

<a name="module_processing/dumpFormatter..formatLabel"></a>

### processing/dumpFormatter~formatLabel(label, [includeImageObjects]) ⇒ <code>object</code>
Format a label tag. See readme.md for information of how the data istransformed

**Kind**: inner method of [<code>processing/dumpFormatter</code>](#module_processing/dumpFormatter)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| label | <code>Object</code> |  | A label as tag parsed by XMLParser which conforms to the schema/label-xml.json schema |
| [includeImageObjects] | <code>boolean</code> | <code>false</code> | If true, include the images object (even though they do not contain URI) |

<a name="module_processing/dumpFormatter..formatArtist"></a>

### processing/dumpFormatter~formatArtist(artist, [includeImageObjects]) ⇒ <code>object</code>
Format an artist tag. See readme.md for information of how the data istransformed

**Kind**: inner method of [<code>processing/dumpFormatter</code>](#module_processing/dumpFormatter)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| artist | <code>Object</code> |  | An artist tag parsed by XMLParser which conforms to the schema/artist-xml.json schema |
| [includeImageObjects] | <code>boolean</code> | <code>false</code> | If true, include the images object (even though they do not contain URI) |

<a name="module_processing/dumpFormatter..formatMaster"></a>

### processing/dumpFormatter~formatMaster(master, [includeImageObjects]) ⇒ <code>object</code>
Format a master tag. See readme.md for information of how the data istransformed

**Kind**: inner method of [<code>processing/dumpFormatter</code>](#module_processing/dumpFormatter)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| master | <code>Object</code> |  | A master tag parsed by XMLParser which conforms to the schema/master-xml.json schema |
| [includeImageObjects] | <code>boolean</code> | <code>false</code> | If true, include the images object (even though they do not contain URI) |

<a name="module_processing/dumpFormatter..formatRelease"></a>

### processing/dumpFormatter~formatRelease(release, [includeImageObjects]) ⇒ <code>object</code>
Format a release tag. See readme.md for information of how the data istransformed

**Kind**: inner method of [<code>processing/dumpFormatter</code>](#module_processing/dumpFormatter)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| release | <code>Object</code> |  | A release tag parsed by XMLParser which conforms to the schema/master-xml.json schema |
| [includeImageObjects] | <code>boolean</code> | <code>false</code> | If true, include the images object (even though they do not contain URI) |

<a name="module_util/parseUtils"></a>

## util/parseUtils
Small helpers for parsing discogs data


* [util/parseUtils](#module_util/parseUtils)
    * [~parseIntSafe(str)](#module_util/parseUtils..parseIntSafe) ⇒ <code>number</code>
    * [~parseDiscogsName(name, target)](#module_util/parseUtils..parseDiscogsName) ⇒ <code>object</code>

<a name="module_util/parseUtils..parseIntSafe"></a>

### util/parseUtils~parseIntSafe(str) ⇒ <code>number</code>
Runs parseInt and errors when the result is NaN

**Kind**: inner method of [<code>util/parseUtils</code>](#module_util/parseUtils)  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | The string to parse |

<a name="module_util/parseUtils..parseDiscogsName"></a>

### util/parseUtils~parseDiscogsName(name, target) ⇒ <code>object</code>
Parses a name from Discogs that potentially has a "(n)" numeric postfix.Stores the result on the specified target object. Will set the followingproperties:name: the name with the "(n)" postfix removed \originalName: the name without modifications \nameIndex: the number n inside the postfix. 1 if there isn't any

**Kind**: inner method of [<code>util/parseUtils</code>](#module_util/parseUtils)  
**Returns**: <code>object</code> - A reference to target  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name to parse |
| target | <code>object</code> | An object to store the results on |

