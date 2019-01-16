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
</dl>

## Constants

<dl>
<dt><a href="#expat">expat</a></dt>
<dd><p>Code based on node-big-xml
<a href="https://github.com/jahewson/node-big-xml">https://github.com/jahewson/node-big-xml</a></p>
</dd>
</dl>

<a name="module_fetcher"></a>

## fetcher
Download data dumps and show download progress


* [fetcher](#module_fetcher)
    * [~ensureDump(version, type, [showProgress])](#module_fetcher..ensureDump) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~ensureDumps(version, [types], [showProgress])](#module_fetcher..ensureDumps) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="module_fetcher..ensureDump"></a>

### fetcher~ensureDump(version, type, [showProgress]) ⇒ <code>Promise.&lt;void&gt;</code>
Ensures a data dump file is downloaded to ./data/<version>/. Doesnothing if a file already exists. Does not verify the file.

**Kind**: inner method of [<code>fetcher</code>](#module_fetcher)  
**Returns**: <code>Promise.&lt;void&gt;</code> - A Promise that completes when all data isdownloaded  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| type | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [showProgress] | <code>boolean</code> | <code>false</code> | Show a progress indicator. For usage in an interactive CLI. On a server you probably want this set to false |

<a name="module_fetcher..ensureDumps"></a>

### fetcher~ensureDumps(version, [types], [showProgress]) ⇒ <code>Promise.&lt;void&gt;</code>
Ensures all the specified types for a specific data dump version aredownloaded to ./data/<version>/

**Kind**: inner method of [<code>fetcher</code>](#module_fetcher)  
**Returns**: <code>Promise.&lt;void&gt;</code> - A Promise that completes when all data isdownloaded  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| [types] | <code>Array.&lt;string&gt;</code> |  | An array of types to get. Possible options: "artists", "labels", "masters" or "releases".  Defaults to all types |
| [showProgress] | <code>boolean</code> | <code>false</code> | Show a progress indicator. For usage in an interactive CLI. On a server you probably want this set to false |

<a name="module_localDumps"></a>

## localDumps
Lookup data dump files that have already been downloaded


* [localDumps](#module_localDumps)
    * [~getXMLPath(version, type, [gz])](#module_localDumps..getXMLPath) ⇒ <code>string</code>
    * [~findXML(version, type, [gz])](#module_localDumps..findXML) ⇒ <code>Object</code> \| <code>null</code>
    * [~findData(version, types)](#module_localDumps..findData) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>

<a name="module_localDumps..getXMLPath"></a>

### localDumps~getXMLPath(version, type, [gz]) ⇒ <code>string</code>
Get the path where a data XML is saved

**Kind**: inner method of [<code>localDumps</code>](#module_localDumps)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| type | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |

<a name="module_localDumps..findXML"></a>

### localDumps~findXML(version, type, [gz]) ⇒ <code>Object</code> \| <code>null</code>
Looks up an existing data xml on disk

**Kind**: inner method of [<code>localDumps</code>](#module_localDumps)  
**Returns**: <code>Object</code> \| <code>null</code> - An object of the form `{ path: string, gz: boolean }`if the file was found, null otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| type | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |

<a name="module_localDumps..findData"></a>

### localDumps~findData(version, types) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>
Looks up the xml files on disk for a given version

**Kind**: inner method of [<code>localDumps</code>](#module_localDumps)  
**Returns**: <code>Array.&lt;(Object\|null)&gt;</code> - An array of results for each type:An object of the form `{ path: string, gz: boolean }` if the file was found,null otherwise  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| types | <code>Array.&lt;string&gt;</code> | An array of types to get. Possible options: "artists", "labels", "masters" or "releases".  Defaults to all types |

<a name="module_remoteDumps"></a>

## remoteDumps
Lookup available data dumps on the S3 bucket


* [remoteDumps](#module_remoteDumps)
    * [~getDumpURL(version, type)](#module_remoteDumps..getDumpURL) ⇒ <code>string</code>
    * [~fetchYearListings()](#module_remoteDumps..fetchYearListings) ⇒ <code>Promise.&lt;Array.&lt;{path:string, year:number}&gt;&gt;</code>
    * [~fetchFileListing(yearPrefix)](#module_remoteDumps..fetchFileListing) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [~parseFileNames(filenames)](#module_remoteDumps..parseFileNames) ⇒ <code>Object</code>

<a name="module_remoteDumps..getDumpURL"></a>

### remoteDumps~getDumpURL(version, type) ⇒ <code>string</code>
Get the URL for a specific data dump

**Kind**: inner method of [<code>remoteDumps</code>](#module_remoteDumps)  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| type | <code>string</code> | The type of data. Can be either "artists", "labels", "masters" or "releases" |

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

<a name="expat"></a>

## expat
Code based on node-big-xmlhttps://github.com/jahewson/node-big-xml

**Kind**: global constant  
