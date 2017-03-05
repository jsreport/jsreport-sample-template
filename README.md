# jsreport-sample-template

jsreport extension which creates sample templates at the first run

jsreport-core
-------------

If you use `jsreport-core`, you can apply this extension manually and [pass configuration](#configuration) to it directly:

```js
var jsreport = require('jsreport-core')();
jsreport.use(require('jsreport-sample-template')({}));
```

Configuration
-------------

Use `sample-template` key in the standard [jsreport config](https://github.com/jsreport/jsreport/blob/master/config.md) file.

Available options:

```js
"sample-template": {
  /* when true, it will create all samples defined in the extension */
  allExamples: false,
  /*
    by default samples will be created only on the first run of your jsreport installation,
    when this option is true it will allow to create the samples in the next run
    (useful when you want to install a new version of this extension and want to create the new examples that come with it)
  */
  forceCreation: false
}
```
