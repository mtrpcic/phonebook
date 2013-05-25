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
    function Phonebook(options){
        this.url      = options.url      || "";
        this.options  = options.options  || {};
        this.data     = options.data     || {};
        this.parent   = options.parent   || null;
    }

    Phonebook.prototype = {
        define: function(object){
            var key = object.name;
            var url = object.url;
            var method = object.type
            var data = object.data;
            var options = object.options;
            var allowed;

            if(allowed = !this[key]){
                this[key] = function(_data, _options){
                    return this.request(method, url, jQuery.extend(data, _data), jQuery.extend(options, _options));
                };
            }
            return allowed;
        },

        request: function(method, url, data, options){
            data = data || {};
            options = options || {};

            return jQuery.ajax(jQuery.extend(this.buildHash("options", options), {
                url: this.getURL() + url,
                type: method,
                data: this.buildHash("data", data)
            }));
        },

        getURL: function(){
            var prefix = "";
            if(this.parent){
                prefix = this.parent.getURL();
            }
            return (prefix + this.url).replace(/[\/]+/gi, "/");
        },

        buildHash: function(key, hash){
            var all = this[key];
            if(typeof hash == "function"){
                hash = hash.bind(hash)();
            }

            if(this.parent){
                all = this.parent.buildHash(key, all);
            }
            return jQuery.extend({}, all, hash);
        },

        addChapter: function(object){
            var allowed;
            var key = object.name;
            if(allowed = !this[key]){
                this[key] = Phonebook.open(jQuery.extend(object, {parent: this}));
            }
            return allowed;
        },

        get:     function(url, data, options){ return this.request("GET",    url, data, options); },
        post:    function(url, data, options){ return this.request("POST",   url, data, options); },
        put:     function(url, data, options){ return this.request("PUT",    url, data, options); },
        destroy: function(url, data, options){ return this.request("DELETE", url, data, options); }
    };
    Phonebook.open = function(options){ return new Phonebook(options); };
    Phonebook.version = "1.0";

    return Phonebook;
})