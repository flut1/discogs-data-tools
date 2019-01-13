## Functions

<dl>
<dt><a href="#getXMLPath">getXMLPath(version, type, [gz])</a> ⇒ <code>string</code></dt>
<dd><p>Get the path where a data XML is saved</p>
</dd>
<dt><a href="#findXML">findXML(version, type, [gz])</a> ⇒ <code>Object</code> | <code>null</code></dt>
<dd><p>Looks up an existing data xml on disk</p>
</dd>
<dt><a href="#findData">findData(version, types)</a> ⇒ <code>Array.&lt;(Object|null)&gt;</code></dt>
<dd><p>Looks up the xml files on disk for a given version</p>
</dd>
</dl>

<a name="getXMLPath"></a>

## getXMLPath(version, type, [gz]) ⇒ <code>string</code>
Get the path where a data XML is saved

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| type | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |

<a name="findXML"></a>

## findXML(version, type, [gz]) ⇒ <code>Object</code> \| <code>null</code>
Looks up an existing data xml on disk

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>null</code> - An object of the form `{ path: string, gz: boolean }`if the file was found, null otherwise  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| version | <code>string</code> |  | The exact version name, eg '20180101' |
| type | <code>string</code> |  | The type of data. Can be either "artists", "labels", "masters" or "releases" |
| [gz] | <code>boolean</code> | <code>false</code> | If this is the compressed file (.xml.gz) or non-compressed (.gz) |

<a name="findData"></a>

## findData(version, types) ⇒ <code>Array.&lt;(Object\|null)&gt;</code>
Looks up the xml files on disk for a given version

**Kind**: global function  
**Returns**: <code>Array.&lt;(Object\|null)&gt;</code> - An array of results for each type:An object of the form `{ path: string, gz: boolean }` if the file was found,null otherwise  

| Param | Type | Description |
| --- | --- | --- |
| version | <code>string</code> | The exact version name, eg '20180101' |
| types | <code>Array.&lt;string&gt;</code> | An array of types to get. Possible options: "artists", "labels", "masters" or "releases".  Defaults to all types |

