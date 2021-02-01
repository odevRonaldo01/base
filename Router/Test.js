'use strict'

let o_resoruce;


class Test {
  static routing(o_configuration) {
    o_resoruce = o_configuration.get("resource")
    o_configuration.get(`/v1/test`, this.list)
    o_configuration.post(`/v1/test`, this.post)
  }
  static async list(req, res) {
    let st_query = 'select * from usuarios'
    let o_response = await o_resoruce.database.postgresql.exec(st_query)
    delete o_response['in_affected_rows'];
    return res.json(o_response)
  }
  static post(req, res) {
    let o_body = req.body
    return res.json(o_body)
  }

}

module.exports = Test