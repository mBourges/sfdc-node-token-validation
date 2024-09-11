import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import {
  getCookie,
  setCookie,
  deleteCookie,
} from 'hono/cookie'
import axios from 'axios'
import * as jwt from 'jsonwebtoken';
import jwks from "jwks-rsa"
import App from './components/app'
import Token from './components/token';
import Candidates from './components/candidates';

const SF_CLIENT_ID: string = process.env.SF_CLIENT_ID || ''
const SF_CLIENT_SECRET: string = process.env.SF_CLIENT_SECRET || ''
const PORT = process.env.PORT || 3000

const app = new Hono()

app.get('/', (context) => {
  const sfToken = getCookie(context, 'sfToken')

  return context.html(<App token={sfToken} />)
})

app.get('/oauth2/login', (context) => {
  const query = new URLSearchParams();

  query.append('response_type', 'code')
  query.append('client_id', SF_CLIENT_ID);
  query.append('redirect_uri', `http://localhost:${PORT}/oauth2/callback`);

  context.header('HX-Redirect', `https://login.salesforce.com/services/oauth2/authorize?${query.toString()}`);

  return context.body(null, 200)
});

app.get('/oauth2/callback', async (context) => {
  const code = context.req.query('code')

  if (!code) {
    return context.body('No code received', 500)
  }

  const query = new URLSearchParams();

  query.append('grant_type', 'authorization_code')
  query.append('code', code)
  query.append('client_id', SF_CLIENT_ID)
  query.append('client_secret', SF_CLIENT_SECRET)
  // @Todo: remove hard coded value
  query.append('redirect_uri', `http://localhost:${PORT}/oauth2/callback`)

  try {
    const response = await axios.request({
      url: 'https://login.salesforce.com/services/oauth2/token',
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: query.toString(),
    });

    setCookie(context, 'sfToken', JSON.stringify(response.data))

    return context.redirect('/');
  } catch(error) {
    console.log(error?.response?.data)
    return context.body(null, 500);
  }
});

app.get('/private/decode', authMiddleware, async (context) => {
  const user = context.get('user')

  try {
    // const tokenData = JSON.parse(req.cookies?.sfToken);
    // const decodedToken = await verifyKey(tokenData);
    return context.html(<Token token={user} />);
  } catch(error) {
    console.log(error.message);
    return context.body(null, 500);
    // res.send('<div id="status">Token not valid</div>');
  }
})

app.get('/private/candidates', authMiddleware, async (context) => {
  const sfToken = getCookie(context, 'sfToken')

  try{
    const tokenData = JSON.parse(sfToken);
    const query = new URLSearchParams();

    query.append('q', 'SELECT Id, Name FROM rpaas_core__Candidate__c Limit 10');

    const response = await axios.request({
      url: `${tokenData.instance_url}/services/data/v60.0/query?${query.toString()}`,
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    return context.html(<Candidates candidates={response?.data?.records} />)
  } catch (error) {
    console.log(error.message)
    return context.body(null, 500)
  }
})

async function authMiddleware (context, next) {
  const sfToken = getCookie(context, 'sfToken')

  if (!sfToken) {
    return context.body('Unauthorized', 401);
  }

  try {
    const tokenData = JSON.parse(sfToken);
    const openidConfiguration = await axios.request({
      url: `${tokenData.instance_url}/.well-known/openid-configuration`,
      method: 'GET',
    });
    // console.log(openidConfiguration?.data?.jwks_uri)
    const client = jwks({ jwksUri: openidConfiguration?.data?.jwks_uri })
    //   // jwksUri: openidConfiguration?.data?.jwks_uri
    //   jwksUri: 'https://hiregenius-qa-dev-ed.my.salesforce.com/id/keys'
    // });

    // console.log(client)
    // console.log(await client.getSigningKeys())

    function getKey(header, callback) {
      // console.log(header.kid, client)
      client.getSigningKey(header.kid, function(err, key) {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      });
    }

    const response = await verify(tokenData.access_token, getKey);
    context.set('user', response);
  } catch (error) {
    console.log(error);
    return context.body('Unthorized', 401);
  }

  await next();
}

function verify(accessToken, getKey, option = {}) {
  return new Promise((resolve, reject) => {
    jwt.verify(accessToken, getKey, option, (err, decoded) => {
      if (err) {
        return reject(err);
      }

      resolve(decoded);
    });
  });
}

console.log(`Server is running on port ${PORT}`)

serve({
  fetch: app.fetch,
  port: PORT
})
