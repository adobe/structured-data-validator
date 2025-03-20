import { google } from 'googleapis';
import fs from 'fs';
import http from 'http';

(async () => {
  const secrets = JSON.parse(
    await readFile(
      join(
        __dirname,
        'client_secret_658166152161-0gpfcghtl8neev44bfq3ku7kf660ssc4.apps.googleusercontent.com.json',
      ),
      'utf8',
    ),
  );

  const oauth2Client = new google.auth.OAuth2(
    secrets.web.client_id,
    secrets.web.client_secret,
    'http://localhost:3000/oauth2callback',
  );

  // Set the scopes
  const scopes = ['https://www.googleapis.com/auth/webmasters'];

  // Only if auth.json does not exist, generate the auth URL
  if (!fs.existsSync('auth.json')) {
    // Generate the auth URL
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    console.log('Auth URL:', url);

    // Create a webserver and listen to port 3000, parse the code and get tokens and write to auth.json
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, 'http://localhost:3000');
      const code = url.searchParams.get('code');
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      res.end('Tokens received');
      console.log('Tokens received:', tokens);
      fs.writeFileSync('auth.json', JSON.stringify(tokens, null, 2));
      server.close();
    });
    server.listen(3000);
  } else {
    // Read tokens from auth.json
    const tokens = JSON.parse(fs.readFileSync('auth.json', 'utf8'));
    oauth2Client.setCredentials(tokens);

    if (oauth2Client.credentials.expiry_date < Date.now()) {
      console.log('Refreshing token');
      try {
        let { tokens } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(tokens);
      } catch (error) {
        console.error('Failed to refresh token:', error);
        throw error;
      }
    }

    google.options({ auth: oauth2Client });

    // Create the Search Console API client
    const searchConsole = google.searchconsole('v1');

    // Function to inspect a URL
    async function inspectUrl(url) {
      try {
        const response = await searchConsole.urlInspection.index.inspect({
          siteUrl: 'https://www.aemshop.net/',
          inspectionUrl: url,
        });
        return response.data;
      } catch (error) {
        console.error('Error inspecting URL:', error);
        throw error;
      }
    }

    // Example usage
    const urlToInspect =
      'https://www.aemshop.net/structured-data/breadcrumb/invalid5';
    const result = await inspectUrl(urlToInspect);
    console.log('Inspection result:', JSON.stringify(result, null, 2));
  }
})();
