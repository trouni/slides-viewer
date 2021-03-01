# Markdown Slides Viewer

[Online slides viewer](https://slides.trouni.com) by [Trouni Tiet](https://github.com/trouni/slides-viewer) (powered by [Reveal.js](https://revealjs.com))

Note: These instructions are also [viewable as slides](https://slides.trouni.com/?src=trouni/slides-viewer).

---

## Slides to display

The slides to display using the viewer can be set using the `src` query parameter. This parameter accepts two types of values:
- a `url` to a markdown file
- a GitHub repository name in the format `<username>/<repo>`, which will load the repo's README.md file into the slides viewer

*Examples:*
```
# URL of a Markdown file
/?src=https://raw.githubusercontent.com/trouni/slides-viewer/master/README.md

# GitHub repository
/?src=trouni/slides-viewer
```

---

## Style customization


### Theme

By default, the slides will be displayed using a custom theme, but you can use another one using the `theme` query parameter.

Available themes include any of the [standard Reveal.js themes](https://revealjs.com/themes/).

*Example:*
```
/?src=trouni/slides-viewer&theme=solarized
```


### Syntax highlighting

By default, code will not use any syntax highlighting (the default theme color will be used for code), unless the theme specifies one.

You can overwrite the syntax highlighter to any of the [hljs color styles](https://github.com/highlightjs/highlight.js/tree/master/src/styles) using the `hljs` query parameter.

*Example:*
```
/?src=trouni/slides-viewer&theme=black&hljs=tomorrow-night
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
/?src=trouni/slides-viewer&slideNumber=false&transition=zoom
```