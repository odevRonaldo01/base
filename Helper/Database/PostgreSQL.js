/**
 * Classes auxíliares para banco de dados
 * 
 * @namespace Helper/Databases
 */

'use strict'
const pg = require('pg');
require('dotenv').config()

/**
 * Objeto do pool de conexões com o PostgreSQL
 * 
 * @static
 * @private
 * @property {object} o_connection
 */
var o_connection;

/**
 * Classe de gestão de conexão com o PostgreSQL
 * 
 * @class PostgreSQL
 */
class PostgreSQL {

	/**
	 * Conecta a um banco de dados
	 * 
	 * @static
	 * @method connect
	 */
	static connect(o_configuration) {
		if (!o_connection) {
			o_configuration["max"] = 10;
			o_configuration["idleTimeoutMillis"] = 30000;
			o_connection = new pg.Pool(o_configuration);
			o_connection.on('connect', function () {
				console.log('PostgreSQL Openned Connection');
			});
			o_connection.on('remove', function () {
				console.log('PostgreSQL Closed Connection');
			});
		};
	}

	/**
	 * Faz a um ping com banco de dados
	 * 
	 * @static
	 * @method ping
	 * @return {promise} resultado do ping
	 */
	static ping() {
		return new Promise(function (resolve, reject) {
			o_connection.query('SELECT 1', (o_error, o_response) => {
				if (o_error)
					return reject(false);
				return resolve(true);
			})
		});
	}

	/**
	 * Executa uma query no banco de dados
	 * 
	 * @static
	 * @method ping
	 * @param {string} st_query query a ser executada
	 * @return {promise} resultado da query
	 */
	static exec(st_query) {
		return new Promise(function (resolve, reject) {
			o_connection.query(st_query, (o_error, o_response) => {
				if (o_error)
					return reject(o_error);
				return resolve(o_response.rows);
			})
		});
	}

	/**
	 * Retorna a constante de erro vinculada a um código
	 * 
	 * @static
	 * @method ping
	 * @param {string} st_code código de erro
	 * @return {string} constante de erro
	 */
	static messageError(st_code) {
		switch (st_code) {
			case '23000':
				return 'integrity_contraint_violation';
			case '23001':
				return 'restrict_violation';
			case '23502':
				return 'not_null_violation';
			case '23503':
				return 'foreign_key_violation';
			case '23505':
				return 'unique_violation';
			case '23514':
				return 'check_violation';
		}
	}
	static disconnect() {
		o_connection.end();
	}

}

module.exports = PostgreSQL;