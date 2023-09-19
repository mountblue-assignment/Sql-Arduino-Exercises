const fs = require('fs');
const { Pool } = require('pg');
const parseString = require('xml2js').parseString;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Arduino',
  password: 'love123',
  port: 5432,
});

fs.readFile('./data/PostLinks.xml', 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading XML file:', err);
    return;
  }
  parseString(data, async (parseErr, result) => {
    if (parseErr) {
      console.error('Error parsing XML:', parseErr);
      return;
    }
    try {
      const rows = Array.isArray(result.postlinks.row)
        ? result.postlinks.row
        : [result.postlinks.row];

      const client = await pool.connect();

      for (const row of rows) {
        console.log(rows);
        const { Id, CreationDate, PostId, RelatedPostId, LinkTypeId } = row.$;
        const query = {
          text: 'INSERT INTO postlinks(id, creationDate, postId, relatedPostId, linkTypeId) VALUES($1, $2, $3, $4, $5)',
          values: [Id, CreationDate, PostId, RelatedPostId, LinkTypeId],
        };

        await client.query(query);
      }

      console.log('Data inserted successfully.');
    } catch (error) {
      console.error('Error inserting data:', error);
    } finally {
      pool.end();
    }
  });
});
