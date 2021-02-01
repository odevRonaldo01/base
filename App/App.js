/**
 * Classes de suporte a execução a aplicação
 *
 * @namespace App
 */

'use strict'

const HTTP = require('http');
const fs = require('fs');
const Express = require('express');
const CORS = require('cors');
const BodyParser = require('body-parser');
const Resource = require('./Resource');
require('dotenv').config()
/**
 * Objeto da aplicação
 *
 * @static
 * @private
 * @property {object} o_app
 */
var o_app;

/**
 * Classe de manipulação da aplicação
 *
 * @class App
 */
class App {

  /**
   * Inicializa a execução da aplicação
   *
   * @method run
   * @static
   * @public
   */
  static run() {
    if (!o_app)
      o_app = new class {

        /**
         * @constructor
         */
        constructor() {
          let in_port = process.env.APP_PORT;
          let st_tag = process.env.APP_TAG;
          // Create HTTP server
          let o_server = this.createServer(in_port);

          // Listen on provided port, on all network interfaces.
          o_server.listen(in_port, function () {
            console.log(`\n---------------------------------------${st_tag}-------------------------------------\n`);
            console.log(`${new Date()}: ${st_tag} Started up at port ${in_port}`);
          });

          // Event listener for HTTP server "error" event
          o_server.on('error', function (o_error) {
            if (o_error.syscall !== 'listen')
              throw o_error;
            let st_bind = `Port ${in_port}`;
            // handle specific listen errors with friendly messages
            switch (o_error.code) {
              case 'EACCES':
                console.error(st_bind + ' requires elevated privileges');
                process.exit(1);
                break;
              case 'EADDRINUSE':
                console.error(st_bind + ' is already in use');
                process.exit(1);
                break;
              default:
                throw error;
            }
          });
          // Event listener for HTTP server "listening" event.
          o_server.on('listening', function () {
            let st_bind = o_server.address().family + 'address ' + o_server.address().address + `port ${in_port}`;
            console.log('Listening on ' + st_bind);
          });
          if (this.in_loglevel > 2) {
            console.log(`\n------------------------------------------APP----------------------------------------\n`);
            console.log(this);
          }
        }

        /**
         * Cria um servidor HTTP
         *
         * @private
         * @method createServer
         * @param {int} in_port porta de exposição do serviço
         * @return {object} objeto de manipulação do servidor HTTP
         */
        createServer(in_port) {
          let o_express = Express();
          o_express.set('port', in_port);
          o_express.set('trust proxy', 1);
          o_express.set('env', process.env.APP_ENVIRONMENT);
          o_express.set('resource', Resource.init());
          o_express.use(CORS({
            "origin": "*",
            "methods": "GET,HEAD,PUT,PATCH,POST,DELETE"
          }));
          o_express.use(Express.urlencoded({ extended: true }));
          o_express.use(Express.json({
            inflate: true,
            limit: '20mb',
            reviver: null,
            strict: true,
            type: 'application/json',
            verify: undefined
          }));
          o_express.use(BodyParser.json({ limit: '20mb', extended: true }));
          o_express.use(BodyParser.urlencoded({ limit: '20mb', extended: true }));
          o_express.use(this.base);
          // Setting routes
          try {
            let v_file = fs.readdirSync('./Router', { encoding: "utf8" });
            for (let st_file of v_file) {
              st_file = `../Router/${st_file}`.replace('.js', '');
              let router = require(st_file);
              router.routing(o_express);
            }
          } catch (e) {
            console.log(e);
          }
          // Print routes
          console.log(`\n------------------------------------------ROUTES----------------------------------------\n`);
          o_express._router.stack.forEach(function (r) {
            if (r.route && r.route.path)
              console.table(Object.keys(r.route.methods) + ' ' + r.route.path);
          });
          return HTTP.createServer(o_express);

        }

        /**
         * Configurações básicas
         *
         * @static
         * @method base
         * @param {object} o_request Objeto de parâmetros de requisição HTTP
         * @param {object} o_response Objeto de parâmetros de resposta HTTP
         */
        base(o_request, o_response, o_next) {
          console.time('time: ');
          let st_ip = o_request.headers['x-forwarded-for'] || o_request.connection.remoteAddress;
          let st_log = `${new Date()}: ${st_ip} - ${o_request.method} - ${o_request.originalUrl}`;
          if (o_request.originalUrl === '/') {
            o_next();
            st_log = `${st_log} - ${o_response.statusCode}`;
          } else {
            o_response.setHeader('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, Cookie, Origin, Via, Referer, Location, Transaction-Hash, Transaction-Tag, Upgrade-Insecure-Requests');
            o_response.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, PUT, POST, DELETE, PATCH, OPTIONS');
            o_response.setHeader('Access-Control-Allow-Credentials', true);
            o_next();
            st_log = `${st_log} - ${o_response.statusCode}`;
          }
          console.log(st_log);
          console.timeEnd('time: ');
        }
      };
  }

}

module.exports = App;
