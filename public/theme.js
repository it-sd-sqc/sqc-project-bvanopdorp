// linting is disabled for local storage references.
// node.js thinks the variable isnt defined, but it's provided by the browser

// get the current theme from localStorage, or default to 'light'
// eslint-disable-next-line no-undef
const currentTheme = localStorage.getItem('theme') || 'light'

// set the theme of the page
if (currentTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.querySelector('header button').innerHTML = '☀️'
} else {
  document.documentElement.setAttribute('data-theme', 'light')
  document.querySelector('header button').innerHTML = '🌙'
}

// eslint-disable-next-line no-unused-vars
function toggleTheme () {
  // get references to the elements we want to change
  const buttonRef = document.querySelector('header button')
  const rootRef = document.documentElement

  if (rootRef.getAttribute('data-theme') === 'dark') {
    rootRef.setAttribute('data-theme', 'light')
    buttonRef.innerHTML = '🌙'
    // eslint-disable-next-line no-undef
    localStorage.setItem('theme', 'light')
  } else {
    rootRef.setAttribute('data-theme', 'dark')
    buttonRef.innerHTML = '☀️'
    // eslint-disable-next-line no-undef
    localStorage.setItem('theme', 'dark')
  }
  console.log('toggle called')
}
