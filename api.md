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
**Returns**: <code>Object</code> \| <code>null</code> - An object of the form `{ path: string, gz: boolean }`if the file was found, null otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| type | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |

<a name="module_dataManager..findData"></a>

### dataManager~findData(version, types) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>
Looks up the xml files on disk for a given version

**Kind**: inner method of [<code>dataManager</code>](#module_dataManager)  
**Returns**: <code>Array.&lt;(Object\|null)&gt;</code> - An array of results for each type:An object of the form `{ path: string, gz: boolean }` if the file was found,null otherwise  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| types | <code>Array.&lt;string&gt;</code> | An array of types to get. Possible options: "artists", "labels", "masters" or "releases".  Defaults to all types |

