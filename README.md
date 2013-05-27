## Phonebook.js
Phonebook.js is a lightweight wrapper for your jQuery.ajax calls.  It makes your code more readable and more maintainable.  With Phonebook.js, your code can change from this:

    var request = $.ajax({
        url: "/api/users/all",
        type: "get",
        dataType: "json",
        data: {
            "active": true
        }
    });

to this:

    var request = API.users.all();

## Setup and Dependencies
Phonebook.js depends on two methods from the jQuery javascript library.  Including jQuery will satisfy these conditions.  If you only want to include the jQuery components that are necessary, you'll need `jQuery.ajax` and `jQuery.extend`.  Once you have your depencies included, simply include Phonebook.js as an external script:

    <script src="phonebook.js" type="text/javascript"></script>

## Usage
The ideal way to use Phonebook.js is to include the library in your source code, and then create a file to contain all of your phonebook definitions.

**Defining a Phonebook**  
You can define as many (or as few) Phonebooks as you like.  There are two ways to define a phonebook, each taking the same argument object.  The parameter object takes three keys:

    var API = Phonebook.open({
        url: "/api",
        options: {},
        data: {}
    });

    var API = new Phonebook({
        url: "/api",
        options: {},
        data: {}
    });

The keys above are used as follows:

* `url`: The url that your requests will use as their "base".  Any requests that specify a URL will have that URL prepended with this
* `options`: Any additional options you'd like to pass to the internal `jQuery.ajax` requests
* `data`: Any data you'd like to pass to the `jQuery.ajax` requests

You can define multiple phonebooks (for example, you have a versioned API and need to talk to both version on one page):

    var API = {
        "v1": Phonebook.open({url: "/api/v1"}),
        "v2": Phonebook.open({url: "/api/v2"})
    };

**Adding Chapters**  
Any phonebook can have chapters added to it.  When adding a chapter, you pass the same options as if you were defining a phonebook, with an added `name` parameter.

    var API = Phonebook.open({...});

    API.addChapter({
        name: "users",
        url: "/users"
    });

If a chapter was successfully added, the `addChapter` method will return `true`.  It will return `false` if the chapter was not succesfully added.  A chapter can not be added if it's name would override any other method that the Phonebook already had (`get`, `put`, `post`, `destroy`, `addChapter`, `define`).  You can now access this chapter via "dot notation":

    API.users.get();

When defining a chapter, you can specify both `data` and `options`, which will override any data/options that were specified on the parent book.  You can also nest chapters as deep as you'd like, generating object chains:

    API.v2.users.active.get();

Internally, each chapter is a Phonebook, and so every chapter has the same methods and properties of a Phonebook.

**Making Requests**  
To generate an AJAX request, you can call the appropriate method on the Phonebook object.  The methods are: `get`, `put`, `post`, and `destroy` (We use `destroy` because `delete` is a reserved keyword in JavaScript).  All request methods take the following arguments:

    API.get(url, data, options);

When making a request, the url provided will be prepended with the url of the phonebook, allowing you to be more concise with your definitions.  Any data or options passed into the request will override the ones from higher up the chain.

**Custom Named Methods**  
On any phonebook object, you can define custom methods.  These also take `data` and `options` parameters, while also accepting `name` (to define the method name), `url`, and `type` (to specify the HTTP request type).

    API.define({
        name: "get_updates",
        url: "/check/updates",
        type: "get"
    });

You can then call this method directly from your phonebook (or chapter) object, like so:

    API.get_updates();

If you want to pass data or options to the custom method, you can do so by passing them as parameters:

    API.get_updates(data, options);

**Callbacks**  
All requests that are made generate `jQuery.ajax` objects and return them.  This means that you can use the `done`, `fail`, `always`, and `then` methods:

    API.get("/example").done(function(){
        console.log(response.message);
    });

## Notes
1. If you define options or data on your phonebooks and chapters, the object will be combined for each request.  This means you can specify a unique set of options for each chapter.  If any option "lower down the chain" (for example, on an individual request) has the same key as one higher up (on a chapter or phonebook), the lowest-level one will take priority and overwrite the others.
2. When passing in options or data, you can pass in a `function`, which will be evaluated, and the return value will be used as the property.
3. Phonebook.js will play nicely with jQuery, even if it is in `noConflict` mode.

## Detailed Example

    // Define your phonebook
    var API = {
        "v1": Phonebook.open({
            url: "/api/v1",
            options: {
                dataType: "json"
            },
            data: {
                api_key: window.user.api_key
            }
        })
    };

    // Set up some chapters
    API.v1.addChapter({
        name: "users",
        url: "/users"
    });

    API.v1.addChapter({
        name: "posts",
        url: "/posts"
    });

    // Add a custom method or two
    API.v1.posts.define({
        name: "new",
        url: "/new",
        type: "get"
    })

    // You're ready to use your new AJAX library! The following will pass the
    // API key and an "author" key as data to the AJAX request.  Because of the
    // nested chapters/books, this request will be the same as the following:
    //
    // $.ajax({
    //     url: "/api/v1/posts/new",
    //     type: "get",
    //     dataType: "json",
    //     data: {
    //         api_key: window.user.api_key,
    //         author: 7
    //     }  
    // });

    API.v1.posts.new({author: 7}).done(function(response){
        // Do something here!
    });

    // Which one looks better?



## Bugs and Contributions
If you find any bugs with Phonebook.js, simply make a Github Issue explaining the issue, preferably with a gist or pastie with example code that demonstrates the issue.

If you have an addition to the library, please follow these steps:

1. Add tests to the test cases in `./tests/spec/PhonebookSpec.js`
2. **Make sure all the tests pass**
3. Do not bump the version number, that will be done by me when merging the pull request
4. Make your pull request!

## License
Copyright (c) 2013 Mike Trpcic, released under the MIT license.
