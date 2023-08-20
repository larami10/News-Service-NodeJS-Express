# News Service CLI Application

A simple News Service application working with NodeJS, understanding the event loop, the file APIs, and Promises/Async-Await. This application features:

1. Asynchronous File I/O with Promises and Async-Await functions.
2. Command-line interface featuring a menu-item selection on console.
3. User can manipulate News.json objects based on command-line inputs:
   1. write a new News Story
   2. update a news story headline
   3. change the content of a news story
   4. delete a news story
   5. search for a news story
4. Application checks and notifies user of invalid inputs.
5. Event emitters and listeners will:
   1. create the logger.txt file if it does not already exist
   2. log when the application starts/exits to the logger.txt file
   3. log when a news story is created to the logger.txt file
   4. log when a news story is deleted to the logger.txt file
6. Timer events give the user 20 seconds to answer a prompt before redirecting user back to the main menu.

## How to use the Project

You can clone the repository and navigate to '1 News Service CLI Application' folder.

### To Run the Project

Open a terminal in the '1 News Service CLI Application' folder and run:

```
node NewsService.js
```
