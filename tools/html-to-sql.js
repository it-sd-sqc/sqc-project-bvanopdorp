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
const sqlHeader = `\\encoding UTF8
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS footnotes;

CREATE TABLE chapters (
  chapter_id SERIAL PRIMARY KEY,
  chapter_title TEXT NOT NULL,
  chapter_synopsis TEXT NOT NULL,
  chapter_body TEXT NOT NULL
);

CREATE TABLE footnotes (
  footnote_id SERIAL PRIMARY KEY,
  footnote_body TEXT NOT NULL
);

INSERT INTO chapters (chapter_title, chapter_synopsis, chapter_body) VALUES
`

// TODO Footnotes extraction
// const insertFootnotesSql = `INSERT INTO footnotes (footnote_body) VALUES
// `

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

  // TODO rework the existing footnote links so they don't point to gutenberg
  // Working plan is to extract the footnote into the database and use that data
  // to present each footnote as mouseover tooltips

  // Body is an array of <p> elements, so when it gets converted into a string they are separated by commas
  // We need to wrap each paragraph in a <p> tag,
  // and use a delimiter that has no content in html
  const bodyText = body.map(p => `<p>${p.innerHTML}</p>`)
  return bodyText.join('\n\n')
}

// Conversion //////////////////////////////////////////////
const src = readFileSync(srcPath, 'utf8')
const domRoot = parse(src)

// Extract the main content chapters
const chapters = []

chapterIds.forEach(
  (id) => {
    // Extract the title
    const title = extractTitle(domRoot, id)
    const synopsis = extractSynopsis(domRoot, id)
    const body = extractBody(domRoot, id)

    chapters.push({
      title,
      synopsis,
      body
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
closeSync(fd)
