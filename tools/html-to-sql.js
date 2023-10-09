import { strict as assert } from 'node:assert'
import { closeSync, openSync, readFileSync, writeFileSync } from 'node:fs'
import { parse } from 'node-html-parser'

const srcPath = 'data/dataSource.html'
const dstPath = 'docs/generated-schema.sql'
const chapterIds = [
  'chap01',
  'chap02',
  'chap03',
  'chap04',
  'chap05',
  'chap06',
  'chap07',
  'chap08',
  'chap09',
  'chap10',
  'chap11',
  'chap12',
  'chap13',
  'chap14',
  'chap15',
  'chap16',
  'chap17',
  'chap18',
  'chap19',
  'chap20',
  'chap21',
  'chap22',
  'chap23',
  'chap24'
]

// Base SQL query
const sqlHeader = `SET client_encoding = 'UTF8';
DROP TABLE IF EXISTS footnotes;
DROP TABLE IF EXISTS chapters;

CREATE TABLE chapters (
  chapter_id SERIAL PRIMARY KEY,
  chapter_title TEXT NOT NULL,
  chapter_synopsis TEXT NOT NULL,
  chapter_body TEXT NOT NULL
);

CREATE TABLE footnotes (
  footnote_id SERIAL PRIMARY KEY,
  footnote_chapter_id SERIAL,
  footnote_body TEXT NOT NULL,
  FOREIGN KEY (footnote_chapter_id) REFERENCES chapters (chapter_id)
);

INSERT INTO chapters (chapter_title, chapter_synopsis, chapter_body) VALUES
`

// Extraction functions
const extractTitle = function (root, id) {
  const titleIdNode = root.querySelector(`h2 > a#${id}`)
  let title = titleIdNode.closest('h2').text
  title = title.replace(/(\r\n|\n|\r)/gm, '')
  title = title.trim()
  return title
}

const extractSynopsis = function (root, id) {
  const titleIdNode = root.querySelector(`h2 > a#${id}`)
  const chapterNode = titleIdNode.closest('div.chapter')
  const synopsis = chapterNode.querySelector(`p.letter`).text
  return synopsis
}

const extractBody = function (root, id) {
  const titleIdNode = root.querySelector(`h2 > a#${id}`)
  const chapterNode = titleIdNode.closest('div.chapter')
  const body = chapterNode.querySelectorAll(`p:not([class])`)
  let footnoteCounter = 1;

  // The footnotes in the base document are all placed at the bottom of the page with links to them
  // We're using them to build tooltips, so we need to adjust the href, change the superscript
  // and append a span that will take the footnote content later
  body.forEach(p => {
    const anchorTags = p.querySelectorAll('a')
    anchorTags.forEach(a => {
      a.setAttribute('href', `#footnote-${footnoteCounter}`)

      const supTags = a.querySelectorAll('sup')
      supTags.forEach(sup => {
        // set the <sup> content to our counter so footnote links start over at [1] for each chapter
        sup.textContent = `[${footnoteCounter}]`
        // Add a tooltip box so we can set up hover effects to show the content
        const tooltip = '<span class="tooltip"></span>'
        a.innerHTML += tooltip
        footnoteCounter++
      })
    })
  })

  // Body is an array of <p> elements, so when it gets converted into a string they are separated by commas
  // We need to wrap each paragraph in a <p> tag,
  // and use a delimiter that has no content in html
  const bodyText = body.map(p => `<p>${p.innerHTML}</p>`)
  return bodyText.join('\n\n')
}

const extractFootnoteBody = function (root, id) {
  const footnoteNode = root.querySelector(`a#linknote-${id}`)
  const footnoteTextNode = footnoteNode.parentNode.nextElementSibling
  let footnoteText = footnoteTextNode.textContent
  // The footnote text has a ton of stuff we don't want, so lets clean it up
  footnoteText = footnoteText.replace(/\[\d+\]\s*/,'')
  footnoteText = footnoteText.replace(/(\r\n|\n|\r)/gm, '')
  footnoteText = footnoteText.replace(/\[|\]/g, '')
  footnoteText = footnoteText.trim()
  return footnoteText
}

// Conversion //////////////////////////////////////////////
const src = readFileSync(srcPath, 'utf8')
const domRoot = parse(src)

// Extract the main content chapters and footnotes
const chapters = []
const footnotes = []

chapterIds.forEach(
  (id) => {
    // Extract the chapter data
    const title = extractTitle(domRoot, id)
    const synopsis = extractSynopsis(domRoot, id)
    const body = extractBody(domRoot, id)
    const chapterIndex = chapterIds.indexOf(id) + 1

    chapters.push({
      title,
      synopsis,
      body
    })

    // Get a node list of each footnote in the current chapter
    const titleIdNode = domRoot.querySelector(`h2 > a#${id}`)
    const chapterNode = titleIdNode.closest('div.chapter')
    const footNoteNodeList = chapterNode.querySelectorAll('.pginternal')


    // Extract the footnote content and tag it with the current chapter ID
    footNoteNodeList.forEach((footNoteNode) => {
      // We only want the number value of the id
      const footnoteId = footNoteNode.id.split('-')[1]
      const footnoteBody = extractFootnoteBody(domRoot, footnoteId)

      footnotes.push({
        chapterIndex,
        footnoteBody
      })
    })
  }
)

// Output the data as SQL.
const fd = openSync(dstPath, 'w')
writeFileSync(fd, sqlHeader)
writeFileSync(fd, `('${chapters[0].title}', '${chapters[0].synopsis}', '${chapters[0].body}')`)
chapters.slice(1).forEach((data) => {
  const value = `,\n('${data.title}', '${data.synopsis}', '${data.body}')`
  writeFileSync(fd, value)
})
writeFileSync(fd, ';\n\n')

// Separate insert commands for each footnote
footnotes.forEach((footnote) => {
  let footnotesSql = `INSERT INTO footnotes (footnote_chapter_id, footnote_body) VALUES `
  footnotesSql += `('${footnote.chapterIndex}', '${footnote.footnoteBody}')`
  footnotesSql += ';\n\n'
  writeFileSync(fd, footnotesSql)
})

closeSync(fd)
