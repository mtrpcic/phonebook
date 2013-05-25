// Phonebook Shim
// --------------
// To properly test that our properties are sent to the jQuery.ajax method, we
// can use this method to replace the real "request" method with one that simply
// returns an object with appropriate keys.

function mockRequest(method, url, data, options){
    data = data || {};
    options = options || {};

    return $.extend(this.buildHash("options", options), {
        url: this.getURL() + url,
        type: method,
        dataType: this.dataType,
        data: this.buildHash("data", data)
    });
}
Phonebook.prototype.request = mockRequest;


// Test Cases Begin
// ----------------
describe("Phonebook", function(){
    describe("instantiation", function(){
        it("should be able to be instiated with 'new'", function(){
            book = new Phonebook({
                url: "/api"
            });
            expect(book instanceof Phonebook).toBe(true);
        });

        it("should work with Phonebook.open", function(){
            book = Phonebook.open({
                url: "/api"
            });
            expect(book instanceof Phonebook).toBe(true);
        });
    })

    describe("adding chapters", function(){
        var book;
        beforeEach(function(){
            book = Phonebook.open({url: "/api"});
        })

        it("should create new chapters with the addChapter method", function(){
            expect(book.addChapter({name: "users"})).toBe(true);

        });

        it("should allow access to chapters via the 'dot notation'", function(){
            book.addChapter({name: "users"})
            expect(book.users instanceof Phonebook).toBe(true);
        });

        it("should disallow chapters that would override other methods", function(){
            book.addChapter({name: "users"});
            expect(book.addChapter({name: "users"})).toBe(false);
        });
    })

    describe("defining custom methods", function(){
        var book;
        beforeEach(function(){
            book = Phonebook.open({url: "/api"});
            book.addChapter({name: "users"});
        })

        it("should allow custom methods on a phonebook", function(){
            expect(book.define({name: "example"})).toBe(true);
        });

        it("should allow custom methods on chapters", function(){
            expect(book.users.define({name: "example"})).toBe(true);
        });

        it("should not allow custom methods that would override other methods", function(){
            book.define({name: "example"})
            expect(book.define({name: "example"})).toBe(false);
        });
    })

    describe("making requests", function(){
        var book;
        beforeEach(function(){
            book = Phonebook.open({url: "/api"});
        })

        it("should allow GET requests", function(){
            result = book.get("/request");
            expect(result.type).toBe("GET");
        });

        it("should allow PUT requests", function(){
            result = book.put("/request");
            expect(result.type).toBe("PUT");
        });

        it("should allow POST requests", function(){
            result = book.post("/request");
            expect(result.type).toBe("POST");
        });

        it("should allow DELETE (destroy) requests", function(){
            result = book.destroy("/request");
            expect(result.type).toBe("DELETE");
        });
    })

    describe("custom data", function(){
        var book;
        beforeEach(function(){
            book = Phonebook.open({
                data: {
                    book: "set",
                    shared: "book"
                }
            });

            book.addChapter({
                name: "users",
                data: {
                    chapter: "set",
                    shared: "chapter"
                }
            });

            book.users.define({
                name: "custom",
                data: {
                    custom: "set",
                    shared: "custom"
                }
            });
        });

        it("should use data on the top-level Phonebook object", function(){
            expect(book.get().data).toEqual({
                book: "set",
                shared: "book"
            });
        });

        it("should use data on the chapter object", function(){
            expect(book.users.get().data).toEqual({
                chapter: "set",
                book: "set",
                shared: "chapter"
            });
        });

        it("should allow data to be passed when naming a route", function(){
            book.define({
                name: "test",
                url: "/test",
                data: {
                    custom: true
                }
            });

            expect(book.test().data.custom).toEqual(true);
        });

        it("should allow data to be passed when calling a route", function(){
            book.define({
                name: "test",
                url: "/test",
                data: {
                    custom: false
                }
            });
            expect(book.test({custom: true}).data.custom).toEqual(true);
        });

        it("should give priority to last-defined data", function(){
            expect(book.users.custom().data.shared).toEqual("custom");
            expect(book.users.custom({shared: "called"}).data.shared).toEqual("called");
        });

        it("should allow a function as data, and use the return value", function(){
            expect(book.get("/url", function(){
                return {function: "function"}
            }).data.function).toEqual("function");
        });
    });

    describe("custom options", function(){
        var book;
        beforeEach(function(){
            book = Phonebook.open({
                options: {
                    book: "set",
                    shared: "book"
                }
            });

            book.addChapter({
                name: "users",
                options: {
                    chapter: "set",
                    shared: "chapter"
                }
            });

            book.users.define({
                name: "custom",
                options: {
                    custom: "set",
                    shared: "custom"
                }
            })
        });

        it("should use options on the top-level Phonebook object", function(){
            var result = book.get();
            expect(result.book).toEqual("set");
            expect(result.shared).toEqual("book");
        });

        it("should use options on the chapter object", function(){
            var result = book.users.get();
            expect(result.chapter).toEqual("set");
            expect(result.book).toEqual("set");
            expect(result.shared).toEqual("chapter");
        });

        it("should allow options to be passed when naming a route", function(){
            book.define({
                name: "test",
                url: "/test",
                options: {
                    custom: true
                }
            });

            var result = book.test();
            expect(result.custom).toEqual(true);
        });

        it("should allow options to be passed when calling a route", function(){
            book.define({
                name: "test",
                url: "/test",
                options: {
                    custom: false
                }
            });
            var result = book.test({}, {custom: true});
            expect(result.custom).toEqual(true);
        });

        it("should give priority to last-defined options", function(){
            expect(book.users.custom().shared).toEqual("custom");
            expect(book.users.custom({}, {shared: "called"}).shared).toEqual("called");
        });

        it("should allow a function as options, and use the return value", function(){
            expect(book.get("/url", {}, function(){
                return {function: "function"}
            }).function).toEqual("function");
        });
    });

    describe("url building", function(){
        var book;
        beforeEach(function(){
            book = Phonebook.open({url: "/1"});
            book.addChapter({name: "users", url: "/2"});
            book.users.define({name: "test", url: "/3"});
        });

        it("should concatenate the request URL with the book URL", function(){
            expect(book.get("/test").url).toEqual("/1/test");
        });

        it("should concatenate the request URL with all chapter URLs", function(){
            expect(book.users.get("/test").url).toEqual("/1/2/test");
        });

        it("should concatenate custom defined route urls", function(){
            expect(book.users.test().url).toEqual("/1/2/3");
        });
    })
});