## Modules

<dl>
<dt><a href="#module_bucket">bucket</a></dt>
<dd><p>Lookup available data dumps on the S3 bucket</p>
</dd>
<dt><a href="#module_dataManager">dataManager</a></dt>
<dd><p>Manage data dump files that have already been downloaded</p>
</dd>
<dt><a href="#module_fetcher">fetcher</a></dt>
<dd><p>Download data dumps and show download progress</p>
</dd>
<dt><a href="#module_processing/dumpFormatter">processing/dumpFormatter</a></dt>
<dd><p>Helpers to transform on the dumps parsed by XMLParser into plain objects
that are easier to work with.</p>
</dd>
<dt><a href="#module_processing/processor">processing/processor</a></dt>
<dd></dd>
<dt><a href="#module_util/parseUtils">util/parseUtils</a></dt>
<dd><p>Small helpers for parsing discogs data</p>
</dd>
</dl>

<a name="module_bucket"></a>

## bucket
Lookup available data dumps on the S3 bucket


* [bucket](#module_bucket)
    * [~getDumpURL(version, collection)](#module_bucket..getDumpURL) ⇒ <code>string</code>
    * [~getChecksumURL(version)](#module_bucket..getChecksumURL) ⇒ <code>string</code>
    * [~fetchYearListings()](#module_bucket..fetchYearListings) ⇒ <code>Promise.&lt;Array.&lt;{path:string, year:number}&gt;&gt;</code>
    * [~fetchFileListing(yearPrefix)](#module_bucket..fetchFileListing) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [~parseFileNames(filenames)](#module_bucket..parseFileNames) ⇒ <code>Object</code>
    * [~getLatestVersion()](#module_bucket..getLatestVersion) ⇒ <code>Promise.&lt;string&gt;</code>

<a name="module_bucket..getDumpURL"></a>

### bucket~getDumpURL(version, collection) ⇒ <code>string</code>
Get the URL for a specific data dump

**Kind**: inner method of [<code>bucket</code>](#module_bucket)  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| collection | <code>string</code> | The type of data. Can be either "artists", "labels", "masters" or "releases" |

<a name="module_bucket..getChecksumURL"></a>

### bucket~getChecksumURL(version) ⇒ <code>string</code>
Get the URL for a checksum file of the specified version

**Kind**: inner method of [<code>bucket</code>](#module_bucket)  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |

<a name="module_bucket..fetchYearListings"></a>

### bucket~fetchYearListings() ⇒ <code>Promise.&lt;Array.&lt;{path:string, year:number}&gt;&gt;</code>
Fetch a set of years available on the Discogs data S3 bucket with theirpaths on the bucket.

**Kind**: inner method of [<code>bucket</code>](#module_bucket)  
<a name="module_bucket..fetchFileListing"></a>

### bucket~fetchFileListing(yearPrefix) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Fetch the list of files available on the S3 bucket for a certain year

**Kind**: inner method of [<code>bucket</code>](#module_bucket)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - An array of paths  

| Param | Type | Description |
| --- | --- | --- |
| yearPrefix | <code>string</code> | The year prefix of the file. For example: "data/2016/" |

<a name="module_bucket..parseFileNames"></a>

### bucket~parseFileNames(filenames) ⇒ <code>Object</code>
Parse a list of file paths (as returned by fetchFileListing). Groups themby year

**Kind**: inner method of [<code>bucket</code>](#module_bucket)  
**Returns**: <code>Object</code> - An object with keys for each year and an array of parsedpath objects as values.  

| Param | Type |
| --- | --- |
| filenames | <code>Array.&lt;string&gt;</code> | 

<a name="module_bucket..getLatestVersion"></a>

### bucket~getLatestVersion() ⇒ <code>Promise.&lt;string&gt;</code>
Gets the name of the latest version available in the S3 bucket

**Kind**: inner method of [<code>bucket</code>](#module_bucket)  
**Returns**: <code>Promise.&lt;string&gt;</code> - A promise that resolves with the version name  
<a name="module_dataManager"></a>

## dataManager
Manage data dump files that have already been downloaded


* [dataManager](#module_dataManager)
    * [~getXMLPath(version, collection, [gz], [dataDir])](#module_dataManager..getXMLPath) ⇒ <code>string</code>
    * [~getChecksumPath(version, [dataDir])](#module_dataManager..getChecksumPath) ⇒ <code>string</code>
    * [~findXML(version, collection, [gz], [dataDir])](#module_dataManager..findXML) ⇒ <code>Object</code> \| <code>null</code>
    * [~findData(version, collections, [dataDir])](#module_dataManager..findData) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>
    * [~globDumps([dataDir])](#module_dataManager..globDumps) ⇒ <code>Object</code>

<a name="module_dataManager..getXMLPath"></a>

### dataManager~getXMLPath(version, collection, [gz], [dataDir]) ⇒ <code>string</code>
Get the path where a data XML is saved

**Kind**: inner method of [<code>dataManager</code>](#module_dataManager)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| collection | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

<a name="module_dataManager..getChecksumPath"></a>

### dataManager~getChecksumPath(version, [dataDir]) ⇒ <code>string</code>
Get the path to where the checksum file for a specified version is stored

**Kind**: inner method of [<code>dataManager</code>](#module_dataManager)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

<a name="module_dataManager..findXML"></a>

### dataManager~findXML(version, collection, [gz], [dataDir]) ⇒ <code>Object</code> \| <code>null</code>
Looks up an existing data xml on disk

**Kind**: inner method of [<code>dataManager</code>](#module_dataManager)  
**Returns**: <code>Object</code> \| <code>null</code> - An object of the form `{ path: string, gz: boolean }`if the file was found, null otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| collection | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

<a name="module_dataManager..findData"></a>

### dataManager~findData(version, collections, [dataDir]) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>
Looks up the xml files on disk for a given version

**Kind**: inner method of [<code>dataManager</code>](#module_dataManager)  
**Returns**: <code>Array.&lt;(Object\|null)&gt;</code> - An array of results for each type:An object of the form `{ path: string, gz: boolean }` if the file was found,null otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| collections | <code>Array.&lt;string&gt;</code> |  | An array of types to get. Possible options: "artists", "labels", "masters" or "releases".  Defaults to all types |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

<a name="module_dataManager..globDumps"></a>

### dataManager~globDumps([dataDir]) ⇒ <code>Object</code>
List all data downloaded to the data directory

**Kind**: inner method of [<code>dataManager</code>](#module_dataManager)  
**Returns**: <code>Object</code> - A map containing all downloaded files  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [dataDir] | <code>string</code> | <code>&quot;\&quot;./data\&quot;&quot;</code> | Root directory where `discogs-data-tools` stores data files. Defaults to ./data relative to working directory |

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

<a name="module_processing/processor"></a>

## processing/processor

* [processing/processor](#module_processing/processor)
    * [~processDumpFile(path, collection, fn, [gz], [chunkSize], [restart], [maxErrors])](#module_processing/processor..processDumpFile) ⇒ <code>Promise</code>
    * [~processDumps(version, fn, [collections], [chunkSize], [restart], [dataDir], [maxErrors])](#module_processing/processor..processDumps) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~processChunkFn](#module_processing/processor..processChunkFn) ⇒ <code>Promise</code>

<a name="module_processing/processor..processDumpFile"></a>

### processing/processor~processDumpFile(path, collection, fn, [gz], [chunkSize], [restart], [maxErrors]) ⇒ <code>Promise</code>
Processes an XML dump file using `node-expat` into plain objects. Every`chunkSize` rows the parser will pause and pass the result to the `fn`function. Once the `fn` function completes, parsing continues until theentire file is parsed.

**Kind**: inner method of [<code>processing/processor</code>](#module_processing/processor)  
**Returns**: <code>Promise</code> - A Promise that resolves when processing is complete  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| path | <code>string</code> |  | The full path to the file to process |
| collection | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| fn | <code>processChunkFn</code> |  | The function to call on each chunk of data. |
| [gz] | <code>boolean</code> | <code>true</code> | A boolean indicating if the dump is compressed in gzip format |
| [chunkSize] | <code>number</code> | <code>1000</code> | The number of XML rows that are parsed by `node-expat` until `fn` is called. A bigger number may be more efficient, but costs more memory |
| [restart] | <code>boolean</code> | <code>false</code> | By default, the processing progress is stored in a `.processing` file alongside the data dumps. If the processing is stopped, it will continue from that row once you call `processDumpFile` again. Set this to `true` to always start from the beginning. |
| [maxErrors] | <code>number</code> | <code>100</code> | If a row fails to insert, details will be logged to a .log file. Once `maxErrors` number of rows have failed to insert, processing will abort and the returned Promise will be rejected. |

**Example**  
```processDumpFile(  './discogs_20190101_artists.xml.gz',  'artists',  chunk => {     // process the results here. For this example, we just console.log them     chunk.forEach(row => console.log(row));     return Promise.resolve();  });```
<a name="module_processing/processor..processDumps"></a>

### processing/processor~processDumps(version, fn, [collections], [chunkSize], [restart], [dataDir], [maxErrors]) ⇒ <code>Promise.&lt;void&gt;</code>
Looks up the downloaded data dumps of a given version. Then calls `processDumpFile`on each of them.

**Kind**: inner method of [<code>processing/processor</code>](#module_processing/processor)  
**See**: processDumpFile  

| Param | Type | Default |
| --- | --- | --- |
| version | <code>string</code> |  | 
| fn | <code>function</code> |  | 
| [collections] | <code>Array.&lt;string&gt;</code> |  | 
| [chunkSize] | <code>number</code> | <code>1000</code> | 
| [restart] | <code>boolean</code> | <code>false</code> | 
| [dataDir] | <code>string</code> | <code>&quot;&#x27;/data&#x27;&quot;</code> | 
| [maxErrors] | <code>number</code> | <code>100</code> | 

<a name="module_processing/processor..processChunkFn"></a>

### processing/processor~processChunkFn ⇒ <code>Promise</code>
The signature of the `fn` function passed to `processDumpFile`

**Kind**: inner typedef of [<code>processing/processor</code>](#module_processing/processor)  
**Returns**: <code>Promise</code> - A promise that resolves when processing is complete  

| Param | Type | Description |
| --- | --- | --- |
| chunk | <code>Array.&lt;Object&gt;</code> | An array of plain objects as parsed by `node-expat` from XML |
| collection | <code>string</code> | The type of collection ("artists", "labels", "masters" or "releases") |

<a name="module_util/parseUtils"></a>

## util/parseUtils
Small helpers for parsing discogs data


* [util/parseUtils](#module_util/parseUtils)
    * [~parseIntSafe(str)](#module_util/parseUtils..parseIntSafe) ⇒ <code>number</code>
    * [~parseDiscogsName(name, target)](#module_util/parseUtils..parseDiscogsName) ⇒ <code>object</code>
    * [~parseDuration(duration, target)](#module_util/parseUtils..parseDuration) ⇒ <code>object</code>
    * [~parseReleaseDate(date, &#x60;target&#x60;)](#module_util/parseUtils..parseReleaseDate)

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

<a name="module_util/parseUtils..parseDuration"></a>

### util/parseUtils~parseDuration(duration, target) ⇒ <code>object</code>
Parses the duration string from a Discogs XML file and stores the resulton the target object. Will store the string as-is on the 'originalDuration'property. If the duration is formatted somewhat correctly, will calculate theduration in number of seconds and store it on the 'duration' property.

**Kind**: inner method of [<code>util/parseUtils</code>](#module_util/parseUtils)  
**Returns**: <code>object</code> - `target` for chaining  

| Param | Type | Description |
| --- | --- | --- |
| duration | <code>string</code> | A duration formatted as string |
| target | <code>object</code> | The target object to store results on |

<a name="module_util/parseUtils..parseReleaseDate"></a>

### util/parseUtils~parseReleaseDate(date, &#x60;target&#x60;)
Will parse the given release date and format it according to DiscogsDatabase Guidelines. The result is stored on the "released" property of thetarget object. The date will be either formatted as YYYY or YYYY-MM-DD.If only the year and month are given, the date will be set to 00. If dashesare missing, they will be added. All other formats are discarded.

**Kind**: inner method of [<code>util/parseUtils</code>](#module_util/parseUtils)  

| Param | Type | Description |
| --- | --- | --- |
| date | <code>string</code> | The date string to parse |
| `target` | <code>object</code> | for chaining |

