'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const app = express();

const PORT = process.env.PORT || 3001;
const SPOTIFY_ID = process.env.SPOTIFY_ID;
const SPOTIFY_SECRET = process.env.SPOTIFY_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const HOME_URI = process.env.HOME_URI;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (request, response) => {
  response.render('index', {set_token :false});
});

app.get('/spotify-signin', (request, response) => {
  superagent.get('https://accounts.spotify.com/authorize')
    .query({client_id: SPOTIFY_ID})
    .query({response_type: 'code'})
    .query({redirect_uri: REDIRECT_URI})
    .query({scope: 'streaming user-read-private user-read-email'})
    .then(result => {
      response.redirect(result.redirects[0])
    })
    .catch(error => console.error('Error while obtaining authorization code:', error));
});

app.get('/spotify-redirect', (request, response) => {
  const code = request.query.code;
  const error = request.query.error;

  if (error) {
    response.send(error);
  }

  superagent.post('https://accounts.spotify.com/api/token')
    .type('form')
    .send({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: SPOTIFY_ID,
      client_secret: SPOTIFY_SECRET
    })
    .then(spotifyResponse => {
      const accessToken = spotifyResponse.body.access_token;
      const refreshToken = spotifyResponse.body.refresh_token;
      const duration = spotifyResponse.body.expires_in;

      response.render('storage', {
        set_token: true,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: duration,
        redirect: HOME_URI
      })
    })
    .catch(error => console.error('Error while obtaining token pair:', error));
});

app.listen(PORT, () => {
  console.log(`Listening on port:`, PORT);
});
