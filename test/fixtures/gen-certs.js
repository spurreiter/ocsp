#!/usr/bin/env node

var fs = require('fs')
var { resolve } = require('path')
var fixtures = require('../fixtures')

var options = {
  serial: 42,
  commonName: 'mega.ca',
  size: 2048
}

fixtures.getOCSPCert(options, function (cert, key) {
  fs.writeFileSync(resolve(__dirname, '/issuer-cert.pem', cert))
  fs.writeFileSync(resolve(__dirname, '/issuer-key.pem', key))

  var options = {
    issuer: cert,
    issuerKey: key,
    serial: 43,
    size: 2048
  }

  fixtures.getOCSPCert(options, function (cert, key) {
    fs.writeFileSync(resolve(__dirname, '/good-cert.pem', cert))
    fs.writeFileSync(resolve(__dirname, '/good-key.pem', key))

    options.serial++

    fixtures.getOCSPCert(options, function (cert, key) {
      fs.writeFileSync(resolve(__dirname, '/revoked-cert.pem', cert))
      fs.writeFileSync(resolve(__dirname, '/revoked-key.pem', key))
    })
  })
})
