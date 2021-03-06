var ocsp = require('..')
var fixtures = require('./fixtures')

var https = require('https')

describe('OCSP Cache', function () {
  var issuer = fixtures.certs.issuer
  var good = fixtures.certs.good

  var server
  var agent
  var cache

  beforeEach(function (cb) {
    server = ocsp.Server.create({
      cert: issuer.cert,
      key: issuer.key
    })

    server.addCert(43, 'good')
    server.addCert(44, 'revoked', {
      revocationTime: new Date(),
      revocationReason: 'CACompromise'
    })

    server.listen(8000, function () {
      cb()
    })

    agent = new ocsp.Agent()

    cache = new ocsp.Cache()
  })

  afterEach(function (cb) {
    server.close(cb)
    agent = null
  })

  it('should cache ocsp response', function (cb) {
    var httpServer = https.createServer({
      cert: good.cert + '\n' + good.issuer,
      key: good.key
    }, function (req, res) {
      res.end('hello world')
    })

    httpServer.on('OCSPRequest', function (cert, issuer, cb) {
      ocsp.getOCSPURI(cert, function (err, uri) {
        if (err) { return cb(err) }

        var req = ocsp.request.generate(cert,
          issuer || fixtures.certs.issuer.cert)
        var options = {
          url: uri,
          ocsp: req.data
        }

        cache.request(req.id, options, cb)
      })
    })

    httpServer.listen(8001, function () {
      https.get({
        agent: agent,
        ca: issuer.cert,
        rejectUnauthorized: false,
        servername: 'local.host',
        port: 8001
      }, function (res) {
        cache.clear()
        cb()
      })
    })
  })
})
