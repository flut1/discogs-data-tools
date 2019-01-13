## Modules

<dl>
<dt><a href="#module_dataManager">dataManager</a></dt>
<dd></dd>
<dt><a href="#module_fetcher">fetcher</a></dt>
<dd></dd>
<dt><a href="#module_listings">listings</a></dt>
<dd></dd>
</dl>

<a name="module_dataManager"></a>

## dataManager

* [dataManager](#module_dataManager)
    * [~getXMLPath(version, type, [gz])](#module_dataManager..getXMLPath) ⇒ <code>string</code>
    * [~findXML(version, type, [gz])](#module_dataManager..findXML) ⇒ <code>Object</code> \| <code>null</code>
    * [~findData(version, types)](#module_dataManager..findData) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>

<a name="module_dataManager..getXMLPath"></a>

### dataManager~getXMLPath(version, type, [gz]) ⇒ <code>string</code>
Get the path where a data XML is saved

**Kind**: inner method of [<code>dataManager</code>](#module_dataManager)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| type | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |

<a name="module_dataManager..findXML"></a>

### dataManager~findXML(version, type, [gz]) ⇒ <code>Object</code> \| <code>null</code>
Looks up an existing data xml on disk

**Kind**: inner method of [<code>dataManager</code>](#module_dataManager)  
**Returns**: <code>Object</code> \| <code>null</code> - An object of the form `{ path: string, gz: boolean }`

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| type | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |

<a name="module_dataManager..findData"></a>

### dataManager~findData(version, types) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>
Looks up the xml files on disk for a given version

**Kind**: inner method of [<code>dataManager</code>](#module_dataManager)  
**Returns**: <code>Array.&lt;(Object\|null)&gt;</code> - An array of results for each type:

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| types | <code>Array.&lt;string&gt;</code> | An array of types to get. Possible options: "artists", "labels", "masters" or "releases".  Defaults to all types |

<a name="module_fetcher"></a>

## fetcher

* [fetcher](#module_fetcher)
    * [~ensureDump(version, type)](#module_fetcher..ensureDump) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~ensureDumps(version, [types])](#module_fetcher..ensureDumps) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="module_fetcher..ensureDump"></a>

### fetcher~ensureDump(version, type) ⇒ <code>Promise.&lt;void&gt;</code>
Ensures a data dump file is downloaded to ./data/<version>/. Does

**Kind**: inner method of [<code>fetcher</code>](#module_fetcher)  
**Returns**: <code>Promise.&lt;void&gt;</code> - A Promise that completes when all data is

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| type | <code>string</code> | The type of data. Can be either "artists", "labels", "masters" or "releases" |

<a name="module_fetcher..ensureDumps"></a>

### fetcher~ensureDumps(version, [types]) ⇒ <code>Promise.&lt;void&gt;</code>
Ensures all the specified types for a specific data dump version are

**Kind**: inner method of [<code>fetcher</code>](#module_fetcher)  
**Returns**: <code>Promise.&lt;void&gt;</code> - A Promise that completes when all data is

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| [types] | <code>Array.&lt;string&gt;</code> | An array of types to get. Possible options: "artists", "labels", "masters" or "releases".  Defaults to all types |

<a name="module_listings"></a>

## listings

* [listings](#module_listings)
    * [~getDumpURL(version, type)](#module_listings..getDumpURL) ⇒ <code>string</code>
    * [~fetchYearListings()](#module_listings..fetchYearListings) ⇒ <code>Promise.&lt;Array.&lt;{path:string, year:number}&gt;&gt;</code>
    * [~fetchFileListing(yearPrefix)](#module_listings..fetchFileListing) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [~parseFileNames(filenames)](#module_listings..parseFileNames) ⇒ <code>Object</code>

<a name="module_listings..getDumpURL"></a>

### listings~getDumpURL(version, type) ⇒ <code>string</code>
Get the URL for a specific data dump

**Kind**: inner method of [<code>listings</code>](#module_listings)  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| type | <code>string</code> | The type of data. Can be either "artists", "labels", "masters" or "releases" |

<a name="module_listings..fetchYearListings"></a>

### listings~fetchYearListings() ⇒ <code>Promise.&lt;Array.&lt;{path:string, year:number}&gt;&gt;</code>
Fetch a set of years available on the Discogs data S3 bucket with their

**Kind**: inner method of [<code>listings</code>](#module_listings)  
<a name="module_listings..fetchFileListing"></a>

### listings~fetchFileListing(yearPrefix) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Fetch the list of files available on the S3 bucket for a certain year

**Kind**: inner method of [<code>listings</code>](#module_listings)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - An array of paths  

| Param | Type | Description |
| --- | --- | --- |
| yearPrefix | <code>string</code> | The year prefix of the file. For example: "data/2016/" |

<a name="module_listings..parseFileNames"></a>

### listings~parseFileNames(filenames) ⇒ <code>Object</code>
Parse a list of file paths (as returned by fetchFileListing). Groups them

**Kind**: inner method of [<code>listings</code>](#module_listings)  
**Returns**: <code>Object</code> - An object with keys for each year and an array of parsed

| Param | Type |
| --- | --- |
| filenames | <code>Array.&lt;string&gt;</code> | 
