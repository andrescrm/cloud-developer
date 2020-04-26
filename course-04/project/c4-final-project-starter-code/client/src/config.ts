// TODO: OK - Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'nrvbteue5d'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: OK - Create an Auth0 application and copy values from it into this map
  domain: 'dev-udagram-auth.auth0.com',            // Auth0 domain
  clientId: '26oPb9eb4NM4KbdwkoDyRogwzQpqsHHm',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback/'
}
