const axios = require('axios');
const jwt = require('jsonwebtoken');

const express = require('express');
const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5000/api/auth/google/callback";

// Step 1: Redirect to Google Login
router.get('/google', (req, res) => {
  const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=email%20profile` +
    `&access_type=offline`;

  res.redirect(googleAuthURL);
});





// Step 2: Handle Google Callback
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { id_token, access_token } = tokenResponse.data;

    // Get user info using access token
    const userInfoResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`
    );

    const user = userInfoResponse.data;

    // Generate JWT Token for our app
    const jwtToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send JWT as response
    res.redirect(`http://localhost:3000/?token=${jwtToken}`);


  } catch (error) {
    console.error("Error during OAuth Callback", error);
    res.status(500).send("Authentication failed.");
  }
});

module.exports = router;