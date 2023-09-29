function toggleTheme () {
  // get references to the elements we want to change
  const buttonRef = document.querySelector('header button')
  const bodyRef = document.body
  const wrapperRef = document.querySelector('#wrapper')
  const navRef = document.querySelector('nav')

  // toggle the dark class each time we click
  bodyRef.classList.toggle('dark')
  wrapperRef.classList.toggle('dark')
  navRef.classList.toggle('dark')

  // change the button icon
  if (bodyRef.classList.contains('dark')) {
    buttonRef.innerHTML = '☀️'
  } else {
    buttonRef.innerHTML = '🌙'
  }
}
