import { html } from 'hono/html'

export default function App({ token }) {
  const tokenData = token && JSON.parse(token)

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SFDC Token verification</title>

        {html`<style>
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .label {
            font-weight: 600;
          }
        </style>`}

        <script src="https://unpkg.com/htmx.org@1.9.10" integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC" crossorigin="anonymous"></script>
      </head>
      <body>
        { !token && <div class="container">
          <h1>Login with Salesforce.com</h1>
          <button
            hx-get="/oauth2/login"
            hx-trigger="click"
            hx-swap="none"
          >
            login
          </button>
        </div> }

        { token && <>
          <div class="">
            <div><span class="label">access_token</span>: { tokenData.access_token }</div>
            <div><span class="label">refresh_token</span>: { tokenData.refresh_token }</div>
            <div><span class="label">signature</span>: { tokenData.signature }</div>
            <div><span class="label">token_format</span>: { tokenData.token_format }</div>
            <div><span class="label">scope</span>: { tokenData.scope }</div>
            <div><span class="label">id_token</span>: { tokenData.id_token }</div>
            <div><span class="label">instance_url</span>: { tokenData.instance_url }</div>
            <div><span class="label">id</span>: { tokenData.id }</div>
            <div><span class="label">token_type</span>: { tokenData.token_type }</div>
            <div><span class="label">issued_at</span>: { tokenData.issued_at }</div>
          </div>
          <div>
            <button
              hx-get="/private/decode"
              hx-trigger="click"
              hx-swap="afterend"
            >
              Decode token
            </button>
            <button
              hx-get="/private/candidates"
              hx-trigger="click"
              hx-swap="outerHTML"
            >
              Get Candidates
            </button>
          </div>
        </>}
      </body>
    </html>
  )
}