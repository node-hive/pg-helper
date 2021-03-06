var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Q = require('q');
var _DEBUG = false;
var _q = require('./../_q');
var _ISQL = _.template('INSERT INTO <%= _q(table.name) %> (<%= fields.map(_q).join(",") %>) VALUES' +
    ' (<%= rows.join(",") %>)' +
    '<% if (returning && returning.length){ %> RETURNING <%= returning.map(_q).join(",") %><% } %>;');

/* ------------ CLOSURE --------------- */

function _insert_sql(table, records, returning) {
    var fields = _.intersection(_.keys(records[0]), _.pluck(_.values(table.columns), 'name'));
    if (!fields.length) return '';

    var rows = records.map(function (record) {
        return '(' + fields.map(function (field) {
            return table.column(field).value(record[field]);
        }, this).join(',') + ')';
    });

    return _ISQL({table: table, _q: _q, _: _, returning: returning, fields: fields, rows: rows})
}

/** ********************
 * Purpose: insert a new record
 *
 * @param client {pg.client}
 * @param records {array} - an array of objects -- key/value records.
 * @param returning {array} - an array of strings, field names, to be fed back.
 * @param cb {function} optional - if ommitted, promise returned.
 * @returns {promise|*|Q.promise}
 */

function insert(client, records, returning, cb) {
    var self = this;

    if (_.isFunction(returning)) {
        cb = returning;
        retrning = null;
    } else if (!_.isArray(returning)) {
        returning = false;
    }

    if (cb) {
        client.query(_insert_sql(this, records, returning), cb);
    } else {
        var deferred = Q.defer();

        var qy = _insert_sql(self, records, returning);
        if (_DEBUG)  console.log('insert SQL: %s', qy);
        client.query(qy, function (err, result) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(result);
            }
        });

        return deferred.promise;
    }
}
/* -------------- EXPORT --------------- */

module.exports = insert;
module.exports.insert_sql = _insert_sql;