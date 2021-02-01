/**
 * Classes de suporte a execução a aplicação
 *
 * @namespace App
 */

'use strict'
const helper = require('../Helper');
require('dotenv').config()

/**
 * Classe de gestão de recursos da aplicação
 *
 * @class Resource
 */
class Resource {

  /**
   * Processa e monta os recursos da aplicação
   *
   * @static
   * @method init
   * @return {object} objeto de manipulação dos recursos da aplicação.
   */
  static init() {
    let o_configuration;
    if (process.env["PGSQL"]) {
      o_configuration = JSON.parse(process.env.PGSQL);
      helper.database.postgresql.connect(o_configuration);
    }
    return helper;
  }
}

module.exports = Resource;
