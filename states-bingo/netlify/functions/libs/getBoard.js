// netlify/functions/getBoard.js
const {
    S3Client,
    GetObjectCommand,
    PutObjectCommand
  } = require('@aws-sdk/client-s3');
  const { generateBoard, streamToString } = require('./lib/board');
  
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
    try {
      // attempt to read existing board from S3
      const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
      const data = await s3.send(getCmd);
      const body = await streamToString(data.Body);
      const board = JSON.parse(body);
      return {
        statusCode: 200,
        body: JSON.stringify(board),
        headers: { 'Content-Type': 'application/json' }
      };
    } catch (err) {
      // if not found or parse error → generate new board
      const board = generateBoard();
      const putCmd = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(board, null,2),
        ContentType: 'application/json'
      });
      await s3.send(putCmd);
      return {
        statusCode: 200,
        body: JSON.stringify(board),
        headers: { 'Content-Type': 'application/json' }
      };
    }
  };
