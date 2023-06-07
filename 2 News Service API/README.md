# News Service API

The News Service Command-Line Interface Application has now been modified to work as an API where a client and server will communicate with the following features:

1. Asynchronous File I/O with Promises and Async-Await functions.
2. A Client web browser can connect to a server on port 3001.
3. Client can manipulate News.json objects based on radio inputs:
   1. write a new News Story
   2. update a News Story headline
   3. change the content of a News Story
   4. delete a News Story
   5. search for a News Story
4. Server checks and notifies Client of invalid inputs with appropriate status codes.

## How to use the Project

You can clone the repository and navigate to '2 News Service API' folder.

### To Run Server

Open a terminal in the '2 News Service API' folder and run:

```
npm install
```

```
node NewsServiceAPI.js
```

### To Run Client

Open a web browser with URL:

```
localhost:3001
```
