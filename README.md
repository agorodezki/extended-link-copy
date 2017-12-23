# extended-link-copy
Plugin for firefox and chrome to copy parts of links to the clipboard.

Use regular expressions to get a part of the href copied to clipboard.

#### Examples

##### Copy just the domain
```.*:\/\/.*?\/```

##### Copy url without attributes
```(.*:\/\/.*?)(\?|$)```

##### Copy just the attributes
```.*:\/\/.*?(\?|$)(.*)```

