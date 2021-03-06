const initSlides = (source, callback = () => {}) => {
  const urlParams = new URLSearchParams(window.location.search);
  const slidesContainer = document.querySelector('.slides')

  // Set text justification
  const justify = urlParams.get('justify');
  if (justify) slidesContainer.classList.add(`text-${justify}`)
  
  const revealSettingsDefault = {
    hash: true,
    width: 1280,
    height: 800,
    controls: true,
    progress: true,
    history: true,
    center: true,
    slideNumber: true,
    disableLayout: false,
    separatorVertical: "^((\r?\n){2}|\r?\n--\r?\n$)",
    // Note that Windows uses `\r\n` instead of `\n` as its linefeed character.
    // For a regex that supports all operating systems, use `\r?\n` instead of `\n`.
    separatorNotes: "^Note:",
    separator: "^((\r?\n){3}|\r?\n---\r?\n$)",
  }
  
  const revealSettings = urlParams
  for (var param in revealSettingsDefault) revealSettings[param] ||= revealSettingsDefault[param]

  const repoToUrl = (source) => {
    let mdUrl = 'https://raw.githubusercontent.com'
    let ghRepo = source.split("/")
    if (!ghRepo[2]) ghRepo.push('master')
    ghRepo.forEach(el => { if (el) mdUrl += '/' + el })
    return `${mdUrl}/README.md`
  }

  const fileUrl = source.match(/https?:\/\/[\w-]+/) ? source : repoToUrl(source)
  
  revealSettings.markdown = fileUrl

  const urlToParentFolder = (url) => {
    const split = url.split('/')
    return split.slice(0, split.length - 1).join("/")
  }
  
  const slides = document.createElement('section')
  for (var option in revealSettings) slides.dataset[option] = revealSettings[option]
  slidesContainer.append(slides)
  
  // Scrollable slides if taller than 800px
  
  const resetSlideScrolling = (slide) => {
    slide.classList.remove('scrollable-slide');
  }
  
  const handleSlideScrolling = (slide) => {
    if (slide.scrollHeight >= 800) {
      slide.classList.add('scrollable-slide');
    }
  }
  
  Reveal.addEventListener('ready', function (event) {
    handleSlideScrolling(event.currentSlide);
    // Fix relative image paths
    document.querySelectorAll('img').forEach(img => {
      const imageSrc = img.getAttribute('src')
      if (!imageSrc.match(/https?:\/\/[\w-]+/)) img.src = `${urlToParentFolder(fileUrl)}/${imageSrc.replace(/^\//, '')}`
    })
    // Make links open in new tab
    document.querySelectorAll('a').forEach(link => link.target = "_blank")
  });
  
  Reveal.addEventListener('slidechanged', function (event) {
    if (event.previousSlide) resetSlideScrolling(event.previousSlide)
    handleSlideScrolling(event.currentSlide);
  });

  document.body.classList.remove('no-slides')
  // More info about config & dependencies:
  // - https://github.com/hakimel/reveal.js#configuration
  // - https://github.com/hakimel/reveal.js#dependencies
  Reveal.initialize({
    ...revealSettings,
  
    plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ]
  }).then(callback);
}