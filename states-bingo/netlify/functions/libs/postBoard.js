// netlify/functions/postBoard.js
const {
    S3Client,
    PutObjectCommand
  } = require('@aws-sdk/client-s3');
  
  const bucket = process.env.S3_BUCKET;
  const key    = 'board.json';
  
  const s3 = new S3Client({
    region: process.env.MY_AWS_REGION,
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    }
  });
    
  exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
  
    let board;
    try {
      board = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }
  
    if (!Array.isArray(board) || board.length !== 49) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Board must be an array of 49 items' })
      };
    }
  
    try {
      const cmd = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(board, null,2),
        ContentType: 'application/json'
      });
      await s3.send(cmd);
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
      console.error('S3 write error:', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to write board to S3' })
      };
    }
  };
  