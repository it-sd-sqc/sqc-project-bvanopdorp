// Used client side
// eslint-disable-next-line no-unused-vars
function changeChapter () {
  const selectElement = document.getElementById('chapters')
  const selectedChapterId = selectElement.options[selectElement.selectedIndex].value
  window.location.href = '/book/' + selectedChapterId
}
