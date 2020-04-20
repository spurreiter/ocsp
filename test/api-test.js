var ocsp = require('../')
var fixtures = require('./fixtures')

var assert = require('assert')
var https = require('https')

describe('OCSP Stapling Provider', function () {
  describe('.check()', function () {
    it('should validate google.com', function (cb) {
      ocsp.check({
        cert: fixtures.google,
        issuer: fixtures.googleIssuer
      }, function (err, res) {
        if (err) { throw err }
        assert.equal(res.type, 'good')
        cb()
      })
    })
  })

  describe('.verify()', function () {
    it('should verify wikipedia.org\'s stapling', function (cb) {
      var req = https.request({
        host: 'wikipedia.org',
        port: 443,
        requestOCSP: true
      }, function (res) {
        // Should not be called
        assert(false)
      })

      req.on('socket', function (socket) {
        socket.on('OCSPResponse', function (stapling) {
          onOCSPResponse(socket, stapling)
        })
      })
      req.on('error', () => {})

      function onOCSPResponse (socket, stapling) {
        var cert = socket.getPeerCertificate(true)

        var request = ocsp.request.generate(cert.raw, cert.issuerCertificate.raw)
        ocsp.verify({
          request,
          response: stapling
        }, function (err, res) {
          assert(!err)

          assert.equal(res.type, 'good')
          socket.end()
          cb()
        })
      }
    })
  })

  describe('.getOCSPURI()', function () {
    it('should work on cert without extensions', function (cb) {
      ocsp.getOCSPURI(fixtures.noExts, function (err) {
        assert(err)
        cb()
      })
    })
  })
})
