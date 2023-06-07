# News Service MVC with Sessions

The News Service MVC has now been modified to work with 3 different roles where a client and server will communicate with the following features:

1. Asynchronous File I/O with Promises and Async-Await functions.
2. A Client web browser can connect to a server on port 3003.
3. The start of the program will display an index page specific to a "Guest" role.
4. The "Guest" role can:
   1. only view articles that are listed as "Public (T)"
   2. can login
5. In the login page, the Client can login as:
   1. "Subscriber" allowing the Client to:
      1. view all "Public (T)" and "Private (F)" articles
      2. logout, view a list of their activity, and destroy their session
   2. "Reporter" allowing the Client to:
      1. view all "Public (T)" articles and articles authored by the Client
      2. manipulate News.json objects based on button inputs:
         1. Add a New Story
         2. Delete a News Story
            1. The "Delete" button will only be displayed for articles authored by the Client
6. Once a "Subscriber" or "Reporter" has logged in, a session with a 10 minute expiration will be created.
7. Server checks and notifies Client of invalid inputs with appropriate status codes.
8. All web pages are displayed based on Client input using .pug files and minor css.

## How to use the Project

You can clone the repository and navigate to '4 News Service MVC with Sessions' folder.

### To Run Server

Open a terminal in the '4 News Service MVC with Sessions' folder and run:

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
localhost:3003
```
