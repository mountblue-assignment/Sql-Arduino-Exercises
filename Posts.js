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

fs.readFile('./data/Posts.xml', 'utf-8', (err, data) => {
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
      const rows = Array.isArray(result.posts.row)
        ? result.posts.row
        : [result.posts.row];

      const client = await pool.connect();

      for (const row of rows) {
        const {
          Id,
          PostTypeId,
          AcceptedAnswerId,
          ParentId,
          CreationDate,
          DeletionDate,
          Score,
          ViewCount,
          Body,
          OwnerUserId,
          OwnerDisplayName,
          LastEditorUserId,
          LastEditorDisplayName,
          LastEditDate,
          LastActivityDate,
          Title,
          Tags,
          AnswerCount,
          CommentCount,
          FavoriteCount,
          ClosedDate,
          CommunityOwnedDate,
          ContentLicense,
        } = row.$;
        const query = {
          text: 'INSERT INTO posts(Id,PostTypeId,AcceptedAnswerId,ParentId,CreationDate,DeletionDate,Score,ViewCount,Body,OwnerUserId,OwnerDisplayName,LastEditorUserId,LastEditorDisplayName,LastEditDate,LastActivityDate,Title,Tags,AnswerCount,CommentCount,FavoriteCount,ClosedDate,CommunityOwnedDate,ContentLicense) VALUES($1, $2, $3, $4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)',
          values: [
            Id,
            PostTypeId,
            AcceptedAnswerId,
            ParentId,
            CreationDate,
            DeletionDate,
            Score,
            ViewCount,
            Body,
            OwnerUserId,
            OwnerDisplayName,
            LastEditorUserId,
            LastEditorDisplayName,
            LastEditDate,
            LastActivityDate,
            Title,
            Tags,
            AnswerCount,
            CommentCount,
            FavoriteCount,
            ClosedDate,
            CommunityOwnedDate,
            ContentLicense,
          ],
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
