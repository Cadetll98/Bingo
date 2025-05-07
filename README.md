Simple Bingo game for the annotation team to keep track of vehicle from each states.
https://states-bingo.netlify.app/

Rules: 
- Call the states as you encounter them. The state/cell you called will no longer be available to other player.
- The first player to get a horizontal, vertical or diagonal lines win.

Structure:
- initialization, API calls handled by serverless function on Netlify.
- Board persisted through s3.
- Frontend enabled by React.
