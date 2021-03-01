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
    separatorVertical: "^(\r?\n\r?\n|--$)",
    // Note that Windows uses `\r\n` instead of `\n` as its linefeed character.
    // For a regex that supports all operating systems, use `\r?\n` instead of `\n`.
    separatorNotes: "^Note:",
    separator: "^---$",
  }
  
  const revealSettings = urlParams
  for (var param in revealSettingsDefault) revealSettings[param] ||= revealSettingsDefault[param]
  
  if (source.match(/https?:\/\/[\w-]+/)) {
    revealSettings.markdown = source
  } else {
    revealSettings.markdown = `https://raw.githubusercontent.com/${source}/master/README.md`
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