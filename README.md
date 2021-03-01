# Slides Viewer

---

## Style customization


### Theme

By default, the slides will be displayed using a custom theme, but you can use another one using the `theme` parameter.

Available themes include any of the [standard Reveal.js themes](https://revealjs.com/themes/).

*Example:*
```
/?source=trouni/slides-viewer&theme=solarized
```


### Syntax highlighting

By default, code will not use any syntax highlighting (the default theme color will be used for code), unless the theme specifies one.

You can overwrite the syntax highlighter to any of the [hljs color styles](https://github.com/highlightjs/highlight.js/tree/master/src/styles) using the `hljs` parameter.

*Example:*
```
/?source=trouni/slides-viewer&theme=black&hljs=tomorrow-night
```

---

## Reveal.js configuration


### Default Reveal.js config

Below are the default Reveal.js config options for the Slides Viewer:

```js
{
  hash: true,
  width: 1280,
  height: 800,
  controls: true,
  progress: true,
  history: true,
  center: true,
  slideNumber: true,
  disableLayout: false,
  separatorVertical: "^(\r?\n\r?\n|--$)",
  separatorNotes: "^Note:",
  separator: "^---$"
}
```


### Custom config


All the [Reveal.js configuration options](https://revealjs.com/config/) can be overridden via the query params.

*Example:*
```
/?source=trouni/slides-viewer&slideNumber=false&transition=zoom
```