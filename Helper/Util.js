/**
 * Classes auxíliares
 * 
 * @namespace Helper
 */

'use strict'

/**
 * Classe de utilitários
 * 
 * @class Util
 * @static
 */
class Util {
	
	static cloneObject(o_source) {
		return JSON.parse(JSON.stringify(o_source));
	}
	
}

module.exports = Util;