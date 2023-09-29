function changeChapter () {
  const selectElement = document.getElementById('chapters')
  const selectedChapterId = selectElement.options[selectElement.selectedIndex].value
  window.location.href = '/book/' + selectedChapterId
}
