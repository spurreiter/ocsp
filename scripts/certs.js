const { exec } = require('shelljs')
const fs = require('fs')

const dir = `${__dirname}/../test/fixtures`

function getCerts (domain, file) {
  const { stdout } = exec(`openssl s_client -showcerts -verify 5 -connect ${domain}:443 < /dev/null`)
  const [cert, issuer] = stdout.match(/(-----BEGIN CERTIFICATE-----[^]+?-----END CERTIFICATE-----)/mg)
  if (file) {
    fs.writeFileSync(`${dir}/${file}-cert.pem`, cert, 'utf8')
    fs.writeFileSync(`${dir}/${file}-issuer.pem`, issuer, 'utf8')
  }
}

getCerts('google.com', 'google')
