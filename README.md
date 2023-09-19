# Your project name
Ben VanOpdorp

This site hosts an english translation of Homer's "The Odyssey"

## ER Diagrams
```mermaid
erDiagram
  chapters {
    chapter_id SERIAL pk
    chapter_numeral TEXT "Chapter number Roman Numeral"
    chapter_content TEXT "Chapter text"
  }
  footnotes {
    footnote_id SERIAL pk
    footnote_body TEXT "Footnote text"
  }
```
