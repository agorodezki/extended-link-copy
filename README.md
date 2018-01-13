# extended-link-copy
Plugin for firefox and chrome to copy parts of links to the clipboard.

Use regular expressions to get parts of the href copied to clipboard.
For further description see the settings page of the plugin.

#### Examples

##### Copy just the domain
* Regex: ```.*:\/\/.*?\/```
* Compose: ```${0}``` or left empty

##### Copy url without attributes
* Regex: ```(.*:\/\/.*?)(\?|$)```
* Compose: ```${1}```

##### Copy just the attributes
* Regex: ```\?(.*)```
* Compose: ```${1}```

##### Make a hyperlink out of the href and copy it
* Regex: ```(.*:\/\/.*?\/).*```
* Compose: ```<a href="${0}">${1}</a>```
