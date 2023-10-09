import 'dotenv/config'
import express from 'express'
import pkg from 'pg'
const { Pool } = pkg

const PORT = process.env.PORT || 5163
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Queries
export const query = async function (sql, params) {
  let client
  let results = []
  try {
    client = await pool.connect()
    const response = await client.query(sql, params)
    if (response && response.rows) {
      results = response.rows
    }
  } catch (err) {
    console.error(err)
  }
  if (client) client.release()
  return results
}

export const queryChapters = async function (id) {
  const sql = 'SELECT chapter_id, chapter_title, chapter_synopsis FROM chapters;'
  const results = await query(sql)
  return results
}

export const queryChapter = async function (id) {
  const sql = `SELECT *, (SELECT COUNT(*) FROM chapters) AS total
    FROM chapters
    WHERE chapter_id = $1;`
  const results = await query(sql, [id])
  return results.length === 1 ? results[0] : []
}

export const queryFootnotes = async function (id) {
  const sql = `SELECT footnote_id, footnote_body FROM footnotes WHERE footnote_chapter_id=$1;`
  const results = await query(sql,[id])
  return results
}

// Server
express()
  .use(express.static('public'))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))

  .set('views', 'views')
  .set('view engine', 'ejs')

// Routes
  .get('/', function (req, res) {
    res.render('pages/index')
  })
  .get('/about', function (req, res) {
    res.render('pages/about', { title: 'About' })
  })
  // Route to the book reader. Default to chapter 1
  .get('/book', async function (req, res) {
    const chapters = await queryChapters()
    const chapter = await queryChapter(1)
    const currentChapter = 1
    const footnotes = await queryFootnotes(1)
    if (chapter?.chapter_title) {
      res.render('pages/book', { chapters, chapter, currentChapter, footnotes })
    } else {
      res.redirect('/chapters')
    }
  })

  // Route to the chapter view. Shows all chapters with synopses
  .get('/chapters', async function (req, res) {
    const chapters = await queryChapters()
    res.render('pages/chapters', { title: 'Chapters', chapters })
  })

  // Routes to specific chapters
  .get('/book/:ch(\\d+)', async function (req, res) {
    const chapters = await queryChapters()
    const chapter = await queryChapter(req.params.ch)
    const currentChapter = req.params.ch
    const footnotes = await queryFootnotes(currentChapter)
    if (chapter?.chapter_title) {
      res.render('pages/book', { chapters, chapter, currentChapter, footnotes })
    } else {
      res.redirect('/chapters')
    }
  })

// Ready for browsers to connect ///////////////////////////
  .listen(PORT, () => console.log(`Listening on ${PORT}`))
