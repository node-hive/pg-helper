var _ = require('underscore');
var pg = require('pg');
var util = require('util');
var _q = require('./_q');

/* --------------- TEMPLATES ----------------- */
var _CT_C_SQL = _.template('<%= _q(column.name) %> <%= column.type %><% if (column.length) { %>(<%= _.isArray(column.length) ? column.length.join(",") : column.length %>)<% } %> <%= column.props.join(" ") %>');

/* ---------------- COLUMN class ------------------- */

function Column(name, type, length, props) {
    this.name = name;
    this.type = type || 'string';
    this.length = length ? length : 0;
    this.props = props ? props : [];
}

_.extend(Column.prototype, {
    create_sql: function () {
        return _CT_C_SQL({
            column: this,
            _q: _q
        });
    },

    toJSON: function () {
        return  _.pick(this, 'name', 'type', 'length', 'props')
    },

    /**
     * converts a javascript scalar into a SQL-relevant string. used for inserts.
     *
     * @param val {variant}
     * @returns {String}
     */
    value: function (val) {
        switch (this.type) {
            case 'integer':
            case 'int':
                return parseInt(val);
                break;

            case 'float':
            case 'double':
            case 'numeric':
                return parseFloat(val);
                break;

            case 'varchar':
            case 'text':
            case 'char':
                return "'" + val + "'";
                //@TODO: better string interpolation
                break;

            default:
                throw new Error(util.format('cannot process field value %s; no handler for type %s', val, this.type));
        }
    }
});

/* ----------------- EXPORTS ------------------ */

module.exports = Column;