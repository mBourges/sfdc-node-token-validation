export default function(props) {
  const { token } = props

  return (<div class="">
    <div><span class="label">scp:</span> { token.scp }</div>
    <div><span class="label">aud:</span> { token.aud }</div>
    <div><span class="label">sub:</span> { token.sub }</div>
    <div><span class="label">nbf:</span> { token.nbf }</div>
    <div><span class="label">mty:</span> { token.mty }</div>
    <div><span class="label">roles:</span> { token.roles }</div>
    <div><span class="label">iss:</span> { token.iss }</div>
    <div><span class="label">exp:</span> { token.exp }</div>
    <div><span class="label">iat:</span> { token.iat }</div>
    <div><span class="label">client_id:</span> { token.client_id }</div>
  </div>)
}