/* Create the variables and functions for NewsService object
 */
class NewsService {
  constructor(file) {
    this.fsPromise = require("fs").promises;

    // Read the file to initialize this.file and this.articles
    readFile(this.fsPromise)
      .then((result) => {
        this.file = result;
        this.articles = this.file.NEWS.ARTICLE;
      })
      .catch((err) => console.error("readFile()) failed", err));

    /* async function that reads the file to return the parsed
     * JSON object
     */
    async function readFile(fsPromise) {
      const data = await fsPromise
        .readFile("./news.json")
        .catch((err) => console.error("Failed to read file", err));

      return JSON.parse(data.toString());
    }

    /* Prompt used to ask the user to enter information that will be used
     * to add a new story. Resolve returns a JSON object. If user does not enter
     * an input within 20 seconds, abort the operation and start from starting prompt.
     */
    function newStoryPromptAwait(rl, ac, signal) {
      return new Promise((resolve) => {
        // Set time t to 20 seconds
        t = setTimeout(() => {
          ac.abort();
          readLine();
        }, 20000);

        // Set the event handler for the signal
        signal.addEventListener(
          "abort",
          () => {
            console.log("\nOperation timed out");
          },
          { once: true }
        );

        rl.question(
          "\nWhat is the title of the new story: ",
          { signal },
          (title) => {
            // Reset time t
            clearTimeout(t);

            // Set time t to 20 seconds
            t = setTimeout(() => {
              ac.abort();
              readLine();
            }, 20000);

            rl.question(
              "Who is the author of the new story: ",
              { signal },
              (author) => {
                // Reset time t
                clearTimeout(t);

                // Set time t to 20 seconds
                t = setTimeout(() => {
                  ac.abort();
                  readLine();
                }, 20000);

                rl.question(
                  "When was this story published? (Enter in 'mm-dd-yyyy' format): ",
                  { signal },
                  (date) => {
                    // Reset time t
                    clearTimeout(t);

                    // Set time t to 20 seconds
                    t = setTimeout(() => {
                      ac.abort();
                      readLine();
                    }, 20000);

                    if (!verifyDate(date)) {
                      console.log(
                        `The date you entered "${date}" is invalid. Please try again with a valid date and format of 'mm-dd-yyyy'`
                      );

                      // Reset time t
                      clearTimeout(t);
                      readLine();
                    }

                    rl.question(
                      "Does this new story require a subscription? (Enter 'T' or 'F'): ",
                      { signal },
                      (pub) => {
                        // Reset time t
                        clearTimeout(t);

                        // Set time t to 20 seconds
                        t = setTimeout(() => {
                          ac.abort();
                          readLine();
                        }, 20000);

                        if (
                          pub.toUpperCase() !== "T" &&
                          pub.toUpperCase() !== "F"
                        ) {
                          console.log(
                            `Your subscription input "${pub}" is invalid. Please try again with a correct input of 'T' or 'F'`
                          );

                          // Reset time t
                          clearTimeout(t);
                          readLine();
                        }

                        rl.question(
                          "Please enter the content of the new story: ",
                          { signal },
                          (content) => {
                            // Reset time t
                            clearTimeout(t);

                            resolve({
                              TITLE: title,
                              AUTHOR: author,
                              DATE: date,
                              PUBLIC: pub.toUpperCase(),
                              CONTENT: content,
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    }

    /* writeNewStory is used to prompt and retrive information from the user
     * to create and add a new story.
     */
    this.writeNewStory = async function (readline, ac, signal) {
      // Prompt user for new story information
      var newStory = await newStoryPromptAwait(readline, ac, signal);

      // used to check if the story already exists
      var check = false;

      // string object of new story
      var checkNewStory = JSON.stringify(newStory);

      // helper variable used to help check if the story already exists
      var temp;

      // Traverse through articles to see if the story already exists
      for (let i = 0; i < this.articles.length; i++) {
        temp = JSON.stringify(this.articles[i]);

        // update check to true if story already exists
        if (checkNewStory === temp) {
          check = true;
        }
      }

      // Call on async writeFile function to retrieve console output
      await writeFile(
        check,
        this.fsPromise,
        this.file,
        this.file.NEWS.ARTICLE,
        newStory
      )
        .then((result) => {
          // console.log the results based on what async writeFile returns
          console.log(result);
          // Start inital prompts
          readLine();
        })
        .catch((err) => console.error("writeFile() failed"));
    };

    /* async writeFile returns the output based on whether or not the story
     * already exists
     */
    async function writeFile(check, fsPromise, file, article, newStory) {
      // if story exists return "This story already exists.
      if (check === true) {
        return "This story already exists.";
      } else {
        // add the new article
        article.push(newStory);

        // write to the file the new JSON object
        await fsPromise.writeFile("./news.json", JSON.stringify(file, null, 4));

        // Emit create to write time to file when new story is added
        await eventEmitter.emit("create");

        // return "New story added successfully"
        return "New story added successfully!";
      }
    }

    /* updateHeadline takes an existing headline (if provided) and a new headline to update
     * a headline.
     */
    this.updateHeadline = async function (headline, newHeadline) {
      headline--;
      var check;

      // check is used to check existence of headline
      if (this.articles.length <= headline || headline < 0) {
        check = "none";
      } else {
        // Check if headline exists or if newHeadline won't change the current headline
        for (let i = 0; i < this.articles.length; i++) {
          if (
            this.articles[headline].TITLE === this.articles[i].TITLE &&
            newHeadline === this.articles[i].TITLE
          ) {
            check = "match";
          } else if (
            this.articles[headline].TITLE === this.articles[i].TITLE &&
            newHeadline !== this.articles[i].TITLE
          ) {
            check = "exists";
            this.articles[i].TITLE = newHeadline;
          }
        }
      }

      // Uses async updateHeadline to retrieve output
      await updateHeadline(check, this.fsPromise, this.file)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => console.error("updateHeadline() failed"));
    };

    /* async updateHeadline returns the output based on the headlines
     * provided by the user
     */
    async function updateHeadline(check, fsPromise, file) {
      // if headline doesn't exists output:
      if (check === "none") {
        return "Can not update headline because the headline you wish to update does not exist.";
        // else if the headline already exists and new headline is the same, output:
      } else if (check === "match") {
        return "The current headline matches the new headline provided, no update was made.";
        // else if the headline exists and new headline is different:
      } else if (check === "exists") {
        // update the JSON file and output:
        await fsPromise.writeFile("./news.json", JSON.stringify(file, null, 4));
        return "Headline was updated successfully!";
      }
    }

    /* changeContent takes an existing content (if provided) and a new content to update
     * content.
     */
    this.changeContent = async function (content, newContent) {
      content--;
      var check;

      // check is used to check existence of content
      if (this.articles.length <= content || content < 0) {
        check = "none";
      } else {
        // Check if content exists or if content won't change the current content
        for (let i = 0; i < this.articles.length; i++) {
          if (
            this.articles[content].CONTENT === this.articles[i].CONTENT &&
            newContent === this.articles[i].CONTENT
          ) {
            check = "match";
          } else if (
            this.articles[content].CONTENT === this.articles[i].CONTENT &&
            newContent !== this.articles[i].CONTENT
          ) {
            check = "exists";
            this.articles[i].CONTENT = newContent;
          }
        }
      }

      // Use async changeContent to retrieve output
      await changeContent(check, this.fsPromise, this.file)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => console.error("changeContent() failed"));
    };

    /* async changeContent returns the output based on the contents
     * provided by the user
     */
    async function changeContent(check, fsPromise, file) {
      // if content doesn't exist, output:
      if (check === "none") {
        return "Can not update content because the content you wish to update does not exist.";
        // else if the content already exists and new content is the same, output:
      } else if (check === "match") {
        return "The current content matches the new content provided, no update was made.";
        // else if the content exists and new content is different:
      } else if (check === "exists") {
        // update the JSON file and output:
        await fsPromise.writeFile("./news.json", JSON.stringify(file, null, 4));
        return "Content was updated successfully!";
      }
    }

    /* deleteStory will validate if a given story exists and delete
     * accordingly
     */
    this.deleteStory = async function (story) {
      // decrement story to fit array range
      story--;
      var check = false;

      // if the number (story) provided is within range
      if (this.articles.length > story && story >= 0) {
        // delete article at element story
        this.articles.splice(story, 1);
        check = true;
      }

      // Use async deleteStory to retrieve output
      await deleteStory(check, this.fsPromise, this.file)
        .then((result) => {
          console.log(result);
        })
        .catch((err) => console.error("deleteStory() failed"));
    };

    /* async deleteStory takes check and update the JSON file
     */
    async function deleteStory(check, fsPromise, file) {
      // if within range, update file
      if (check === true) {
        await fsPromise.writeFile("./news.json", JSON.stringify(file, null, 4));

        // Emit delete to write time to file when story is deleted
        await eventEmitter.emit("delete");

        return "The story was deleted successfully!";
      } else {
        return "Invalid input";
      }
    }

    /* collect will search through all stories in the news.json file to search
     * for stories that match a given substring of a title, date range, or
     * name of an author
     */
    this.collect = function (collection) {
      // collect is an empty array
      var collect = new Array();

      // Search through stories and add them to collect array if there's a match
      for (let i = 0; i < this.articles.length; i++) {
        if (
          this.articles[i].TITLE.toLowerCase().includes(
            collection.toLowerCase()
          ) ||
          collection === this.articles[i].DATE ||
          collection.toLowerCase() === this.articles[i].AUTHOR.toLowerCase()
        ) {
          collect.push(this.articles[i]);
        }
      }

      // if collect array is not empty, output the list of matches
      if (collect.length > 0) {
        for (let i = 0; i < collect.length; i++) {
          console.log(collect[i]);
        }
        // else output:
      } else {
        console.log("There are no stories that match your search.");
      }
    };

    function verifyDate(date) {
      var dateformat =
        /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;

      // Match the date format through regular expression
      if (dateformat.test(date)) {
        // Extract the string into month, date and year
        var pdate = date.split("-");

        var day = parseInt(pdate[0]);
        var month = parseInt(pdate[1]);
        var year = parseInt(pdate[2]);

        // Check the ranges of month and year
        if (year < 1000 || year > 3000 || month == 0 || month > 12)
          return false;

        var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // Adjust for leap years
        if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
          monthLength[1] = 29;

        // Check the range of the day
        return day > 0 && day <= monthLength[month - 1];
      } else {
        return false;
      }
    }
  }
}

// Instantiate newService object
var newsService = new NewsService("./news.json");

// Create readline input/output
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// use t to set signal time
var t;

// use global date to create new Object dates
var date;

/* Emitter constructor */
class Emitter {
  constructor() {
    this.events = {};
  }
  /* Add on method to Emitter object */
  on(type, listener) {
    // check if listener is a function
    if (typeof listener !== "function") {
      // throw error if listener is not a function
      throw new Error("Listener must be a function!");
    }

    // create event listener property array
    this.events[type] = this.events[type] || [];

    // add listener to events array
    this.events[type].push(listener);
  }
  /* Add emit method to Emitter object */
  emit(type) {
    // check if event is a property on Emitter
    if (this.events[type]) {
      // Invoke all listeners inside events array
      this.events[type].forEach(function (listener) {
        listener();
      });
    }
  }
}

// Instantiate Emitter object
var eventEmitter = new Emitter();

// add 'start' listener
eventEmitter.on("start", () => {
  date = new Date();
  writeEmit("start", date);
});

// add 'exit' listener
eventEmitter.on("exit", () => {
  date = new Date();
  writeExitEmit("exit", date);
});

// add 'create' listener
eventEmitter.on("create", () => {
  date = new Date();
  writeEmit("create", date);
});

// add 'delete' listener
eventEmitter.on("delete", () => {
  date = new Date();
  writeEmit("delete", date);
});

/* Write time to logger.txt when start,
 * create, and delete are emitted
 */
async function writeEmit(type, date) {
  const fs = require("fs").promises;

  // Format the content being written to file
  var content = type + ": " + date.toString() + "\n";

  // a+ flag is used to read/write and create new file if needed
  await fs.writeFile("./logger.txt", content, { flag: "a+" });
}

// This is called after pressing Ctrl+C to close the program
readline.on("close", async function () {
  // Emit exit to write to to file when program exits
  await eventEmitter.emit("exit");
});

/* Write time to logger.txt when the
 * program exits.
 */
async function writeExitEmit(type, date) {
  const fs = require("fs").promises;

  // Format the content being written to file
  var content = type + ": " + date.toString() + "\n";

  // a+ flag is used to read/write and create new file if needed
  await fs.writeFile("./logger.txt", content, { flag: "a+" });

  // Exit program
  console.log("\n Exiting...");
  process.exit(0);
}

// Emit start to write starting time to file
eventEmitter.emit("start");

// Start program
readLine();

/* Prompts the user the main questions and makes calls to
 * newService object depending on user input.
 */
function readLine() {
  // create abort controller and signal
  const ac = new AbortController();
  const signal = ac.signal;

  // Main prompt questions
  readline.question(
    "\nPlease choose from the following:\n" +
      "1. Write a new news story\n" +
      "2. Update a news story headline\n" +
      "3. Change the content of a news story\n" +
      "4. Delete a news story\n" +
      "5. Search for a new story\n" +
      "Choice: ",
    (choice) => {
      // if invalid input, restart main prompt
      if (choice <= 0 || choice > 5 || isNaN(choice)) {
        console.log("\nInvalid input, try again!");
        readLine();
      }

      // Switch case depending on user input
      switch (choice) {
        case "1": // Begins operation to add new story to news.json
          newsService.writeNewStory(readline, ac, signal);
          break;
        case "2":
          // Begins operation to update a story's headline
          newHeadlineUpdate(newsService, readline, ac, signal);
          break;
        case "3":
          // Begins operation to update the content of a story
          newContentUpdate(newsService, readline, ac, signal);
          break;
        case "4":
          // Begins operation to delete a story
          del(newsService, readline, ac, signal);
          break;
        case "5":
          // Begins operation to search for a story
          collect(newsService, readline, ac, signal);
          break;
      }
    }
  );
}

/* This function prompts the user for the headline they wish to replace and
 * also for the new headline they wish to replace it with. Using a promise,
 * this function returns an array of the 2 items back to the async function
 * newHewalineUpdate. If user does not enter an input within 20 seconds, abort
 * the operation and start from starting prompt.
 */
function newHeadlineUpdateAwait(rl, ac, signal) {
  return new Promise((resolve) => {
    // Set time t to 20 seconds
    t = setTimeout(() => {
      ac.abort();
      readLine();
    }, 20000);

    // Set the event handler for the signal
    signal.addEventListener(
      "abort",
      () => {
        console.log("\nOperation timed out");
      },
      { once: true }
    );

    rl.question(
      "\nEnter the number of the title you wish to replace: ",
      { signal },
      function (change) {
        // Reset time t
        clearTimeout(t);

        // Set time t to 20 seconds
        t = setTimeout(() => {
          ac.abort();
          readLine();
        }, 20000);

        rl.question("Enter the new headline: ", { signal }, function (update) {
          //Reset time t
          clearTimeout(t);
          var headlines = [change, update];
          resolve(headlines);
        });
      }
    );
  });
}

/* Async function called by the main prompt when user decides to update a
 * headline. Retrieves the old and new headlines entered by the user and
 * sends them to another function to validate and update the headlines if
 * available. If user does not enter an input within 20 seconds, abort
 * the operation and start from starting prompt.
 */
async function newHeadlineUpdate(newsService, rl, ac, signal) {
  console.log();
  // Lists the current headlines to the user
  for (let i = 0; i < newsService.articles.length; i++) {
    console.log("Title " + (i + 1) + ": " + newsService.articles[i].TITLE);
  }

  // Wait until the user provides the old and new headlines
  var headlines = await newHeadlineUpdateAwait(rl, ac, signal);

  // Validate and update headline
  await newsService.updateHeadline(headlines[0], headlines[1]);

  // Start the initial prompts
  readLine();
}

/* This function prompts the user for the content they wish to replace and
 * also for the new content they wish to replace it with. Using a promise,
 * this function returns an array of the 2 items back to the async function
 * newContentUpdate. If user does not enter an input within 20 seconds, abort
 * the operation and start from starting prompt.
 */
function newContentUpdateAwait(rl, ac, signal) {
  return new Promise((resolve) => {
    // Set time t to 20 seconds
    t = setTimeout(() => {
      ac.abort();
      readLine();
    }, 20000);

    // Set the event handler for the signal
    signal.addEventListener(
      "abort",
      () => {
        console.log("\nOperation timed out");
      },
      { once: true }
    );

    rl.question(
      "\nEnter the number of the content you wish to replace: ",
      { signal },
      (change) => {
        // Reset time t
        clearTimeout(t);

        // Set time t to 20 seconds
        t = setTimeout(() => {
          ac.abort();
          readLine();
        }, 20000);

        rl.question("Enter the new content: ", { signal }, (update) => {
          // Reset time t
          clearTimeout(t);
          var content = [change, update];
          resolve(content);
        });
      }
    );
  });
}

/* Async function called by the main prompt when user decides to update a
 * content. Retrieves the old and new contents entered by the user and
 * sends them to another function to validate and update the contents if
 * available.
 */
async function newContentUpdate(newsService, rl, ac, signal) {
  console.log();
  // List the current contents to the user
  for (let i = 0; i < newsService.articles.length; i++) {
    console.log(
      "Content " + (i + 1) + ": " + newsService.articles[i].CONTENT + "\n"
    );
  }

  // Retrieve the old and new contents
  var content = await newContentUpdateAwait(rl, ac, signal);

  // Validate and update contents if available
  await newsService.changeContent(content[0], content[1]);

  // Start the initial prompts
  readLine();
}

/* This function prompts the user for the title of the story they wish to
 * delete. Using a promise,this function returns the title of the story
 * the user wishes to delete back to del. If user does not enter an input within 20 seconds, abort
 * the operation and start from starting prompt.
 */
function delAwait(rl, ac, signal) {
  return new Promise((resolve) => {
    // Set time t to 20 seconds
    t = setTimeout(() => {
      ac.abort();
      readLine();
    }, 20000);

    // Set the event handler for the signal
    signal.addEventListener(
      "abort",
      () => {
        console.log("\nOperation timed out");
      },
      { once: true }
    );

    rl.question(
      "\nBased on these titles, enter the number of the story you wish to delete: ",
      { signal },
      (del) => {
        // Reset time t
        clearTimeout(t);
        resolve(del);
      }
    );
  });
}

/* Async function called by the main prompt when user decides to delete a
 * story. Retrieves the title of the story that the user wishes to delete.
 */
async function del(newsService, rl, ac, signal) {
  console.log();
  // Lists the current titles to the user
  for (let i = 0; i < newsService.articles.length; i++) {
    console.log("Title " + (i + 1) + ": " + newsService.articles[i].TITLE);
  }

  // Retrieves the title the user enters
  var del = await delAwait(rl, ac, signal);

  // Validate and delete a story based on the title
  await newsService.deleteStory(del);

  // Start the intial prompts
  readLine();
}

/* This function prompts the user to enter a substring of a title, date range,
 * or the name of an author to search and return items that match. If user does
 * not enter an input within 20 seconds, abort the operation and start from
 * starting prompt.
 */
function collectAwait(rl, ac, signal) {
  return new Promise((resolve) => {
    // Set time t to 20 seconds
    t = setTimeout(() => {
      ac.abort();
      readLine();
    }, 20000);

    // Set the event handler for the signal
    signal.addEventListener(
      "abort",
      () => {
        console.log("\nOperation timed out");
      },
      { once: true }
    );

    rl.question(
      "\nEnter a substring of a title, date range, or the name of an author to search: ",
      { signal },
      (col) => {
        // Reset time t
        clearTimeout(t);
        resolve(col);
      }
    );
  });
}

/* Async function called by the main prompt when user decides to make a
 * search based on the substring of a title, date range, or the name
 * of an author.
 */
async function collect(newsService, rl, ac, signal) {
  // Retrieve a substring of a title, date range, or name of author
  var col = await collectAwait(rl, ac, signal);

  // Validate and return a list that matches the search entered
  await newsService.collect(col);

  // Start the initial prompts
  readLine();
}
