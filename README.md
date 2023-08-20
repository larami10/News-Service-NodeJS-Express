# News Service MVC

The News Service API has now been modified to work as an MVC where a client and server will communicate with the following features:

1. Asynchronous File I/O with Promises and Async-Await functions.
2. A Client web browser can connect to a server on port 3002.
3. A Client will be asked to enter their name to start the program.
   1. once Client enters a name, the index page will load
   2. a session will be created with an expiration of 10 minutes
4. Client can manipulate News.json objects based on radio inputs:
   1. write a new News Story
   2. delete a News Story
   3. search for a News Story
5. Server checks and notifies Client of invalid inputs with appropriate status codes.
6. All web pages are displayed based on Client input using .pug files and minor css.

## How to use the Project

You can clone the repository and navigate to '3 News Service MVC' folder.

### To Run Server

Open a terminal in the '3 News Service MVC' folder and run:

> **_NOTE:_** You may need to run npm install express before npm install:

```
npm install express
```

```
npm install
```

```
node NewsServiceMVC.js
```

### To Run Client

Open a web browser with URL:

```
localhost:3002
```
