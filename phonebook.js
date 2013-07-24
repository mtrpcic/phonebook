/*!
  * Phonebook - An AJAX wrapper to clean up your AJAX soup
  * Copyright: Mike Trpcic 2013
  * https://github.com/mtrpcic/phonebook
  * Version: 1.0
  * License: MIT
  */

!function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
}('Phonebook', function () {
    function Phonebook(options) {
        this.url = options.url || "";
        this.options = options.options || {};
        this.data = options.data || {};
        this.isRestful = options.isRestful;
        this.parent = options.parent || null;
        this.isBase = !this.parent;
    }

    var urlPlaceholderRegex = new RegExp(/\{{1}(\w*)\}{1}/gi);
    Phonebook.prototype = {
        define: function (object) {
            var key = object.name;
            var url = object.url;
            var method = object.type
            var data = object.data;
            var options = object.options;
            var allowed;

            if (allowed = !this[key]) {
                this[key] = function (_data, _options) {
                    return this.request(method, url, jQuery.extend(data, _data), jQuery.extend(options, _options));
                };
            }
            return allowed;
        },

        request: function (method, url, data, options) {
            data = this.buildHash("data", data || {});
            options = this.buildHash("options", options);
            url = url || '';

            var isGet = method == 'GET',
                url = this.getURL() + url,
                placeholders;

            while (placeholders = urlPlaceholderRegex.exec(url)) {
                var placeholder = placeholders[0],
                    key = placeholders[1];

                url = url.replace(placeholder, data[key] || '');
            }

            url = url.replace('//', '/');
            url = this.isRestful && url[url.length - 1] == '/' ? url.slice(0, -1) : url;

            return jQuery.ajax(jQuery.extend(options, {
                url: url,
                type: method,
                contentType: !isGet ? 'application/json; charset=utf-8' : undefined,
                processData: isGet,
                data: !isGet ? JSON.stringify(data) : data
            }));
        },

        getURL: function () {
            var prefix = this.parent ? this.parent.getURL() : '';
            prefix = (prefix + this.url).replace(/[\/]+/gi, "/");

            if (this.parent && !this.parent.isBase) {
                prefix += '/{' + this.name + 'Id}';
            }
            else if (this.parent && this.parent.isBase) {
                prefix += '/{id}';
            }

            return prefix;
        },

        buildHash: function (key, hash) {
            var all = this[key];
            if (typeof hash == "function") {
                hash = hash.bind(hash)();
            }

            if (this.parent) {
                all = this.parent.buildHash(key, all);
            }
            return jQuery.extend({}, all, hash);
        },

        addChapter: function (object) {
            var allowed;
            var key = object.name;
            if (allowed = !this[key]) {
                this[key] = Phonebook.open(jQuery.extend(object, { parent: this, isRestful: this.isRestful }));
                this[key].name = key;
            }
            return allowed;
        },

        get: function (data, url, options) { return this.request("GET", url, data, options); },
        post: function (data, url, options) { return this.request("POST", url, data, options); },
        put: function (data, url, options) { return this.request("PUT", url, data, options); },
        destroy: function (data, url, options) { return this.request("DELETE", url, data, options); },
    };
    Phonebook.open = function (options) { return new Phonebook(options); };
    Phonebook.version = "1.0";

    return Phonebook;
})