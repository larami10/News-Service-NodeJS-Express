// Instantiate newService object
var newsService = new NewsService("./news.json");

// include url, fs
var url = require("url");
const fs = require("fs");

// include express and bodyParser
var express = require("express");
var bodyParser = require("body-parser");
var sessions = require("express-session");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Create a session that expires after 10 minutes
app.use(
  sessions({
    secret: "MAGICALEXPRESSKEY",
    resave: false,
    cookie: { expires: 600000 },
    saveUninitialized: false,
  })
);

var session;

// listen to port 3002
app.listen(3002);

app.set("views", "./views");
app.set("view engine", "pug");

/* Display the landing page. */
app.get("/", function (req, res, next) {
  // get session
  session = req.session;

  // if session.userid exists
  if (session.userid) {
    // Display index.pug
    res.type("html");
    res.render("index", { welcome: "Welcome " + session.userid + "!" });
    // else redirect to /login
  } else {
    res.redirect("/login");
  }
});

/* Display the login page. */
app.get("/login", function (req, res) {
  // Display login.pug
  res.render("login");
});

/* Create session and set userid to login. Redirect to landing page */
app.post("/login", function (req, res) {
  // Notify client that the login field is empty and it's required
  if (req.body.login === "") {
    res.status(400);
    res.render("display", {
      p: `Required Key: "login" not present in sent blueprint`,
    });
  } else {
    session = req.session;
    session.userid = req.body.login;
    res.redirect("/");
  }
});

/* /getStoryInfo is used as a getter to get the url query information to
 * determine which operation the client selected and be able to route
 * the correct page that needs to be displayed.
 */
app.get("/getStoryInfo", function (req, res) {
  // parse the url
  let urlObj = url.parse(req.url, true, false);
  // qstr will hold the query
  let qstr = urlObj.query;

  res.type("html");

  // if client chose to add a new story
  if (qstr.methodType === "newStory") {
    // Display write.pug
    res.render("write", { welcome: "Welcome " + session.userid + "!" });
    // else if client chose to delete a story
  } else if (qstr.methodType === "deleteStory") {
    var temp = [];
    // Lists the current titles to the user
    for (let i = 0; i < newsService.articles.length; i++) {
      temp.push(JSON.stringify(newsService.articles[i].TITLE));
    }

    // Display delete.pugh
    res.render("delete", {
      welcome: "Welcome " + session.userid + "!",
      array: temp,
    });
    // else if client chose to perform a search
  } else if (qstr.methodType === "search") {
    // Display search.pug
    res.render("search", { welcome: "Welcome " + session.userid + "!" });
  }
});

/* /searching will take the client's input from the search form and will get
 * information from the server to display to the client.
 */
app.get("/searching", function (req, res) {
  // parse the url
  let urlObj = url.parse(req.url, true, false);
  // qstr will hold the query
  let qstr = urlObj.query;

  // use resMsg to add to output string
  var resMsg = "";

  // Notify client that the search field is empty and it's required
  if (qstr.search === "") {
    resMsg = `search`;
    collect(res, resMsg, false, null, null);
    // else send the search string to collect() and display appropriate message
  } else {
    collect(res, resMsg, true, qstr.search);
  }
});

/* /newStory will take client input and add a new story to the news.json file.
 * If client provides invalid inputs, /newStory will display appropriate
 * error messages to client.
 */
app.post("/newStory", function (req, res) {
  // use resMsg to add to output string
  var resMsg = "";

  // Notify client that the title field is empty and it's required
  if (req.body.title === "") {
    resMsg = `title`;
    addStory(res, resMsg, false);
    // Notify client that the author field is empty and it's required
  } else if (req.body.author === "") {
    resMsg = `author`;
    addStory(res, resMsg, false);
    // Notify client that the date field is empty and it's required
  } else if (req.body.date === "") {
    resMsg = `date`;
    addStory(res, resMsg, false);
    // Notify client that the type field is empty and it's required
  } else if (req.body.type === "") {
    resMsg = `type`;
    addStory(res, resMsg, false);
    // Notify client that the content field is empty and it's required
  } else if (req.body.content === "") {
    resMsg = `content`;
    addStory(res, resMsg, false);
    // Notify client whether the story will be added or not
  } else {
    var year = req.body.date.slice(0, 4);
    var day = req.body.date.slice(5, 7);
    var month = req.body.date.slice(8, 10);
    var date = day + "-" + month + "-" + year;
    resMsg = {
      TITLE: req.body.title,
      AUTHOR: req.body.author,
      DATE: date,
      PUBLIC: req.body.type,
      CONTENT: req.body.content,
    };
    addStory(res, resMsg, true);
  }
});

/* /deleteStory will take client input and delete a new story from the news.json file.
 * If client provides invalid inputs, /deleteStory will display appropriate
 * error messages to client.
 */
app.post("/deleteStory", function (req, res) {
  // use resMsg to add to output string
  var resMsg = "";

  // Notify client that the delete field is empty and it's required
  if (req.body.delete === "") {
    resMsg = `delete`;
    del(res, resMsg, false, null, null);
    // Notify client whether the story was deleted or not
  } else {
    del(res, resMsg, true, req.body.delete);
  }
});

/* async addStory will display the HTML response for when a new story is added to
 * the news.json file. addStory will also send any errors messages depending
 * on client input.
 */
async function addStory(res, resMsg, input) {
  // Notify client if a required field was not entered and set status to 400
  if (input === false) {
    resMsg = `Required Key: "` + resMsg + `" not present in sent blueprint`;
    res.status(400);
    // else if client filled in all required fields
  } else {
    // Validate and add new story
    var str = await newsService.writeNewStory(resMsg, fs);

    // if str is true (story already exists)
    if (str === true) {
      // add error message and set status to 400
      resMsg = `This story already exists.`;
      res.status(400);
      // else story does not currently exist in news.json
    } else {
      // add success message and set status to 201
      resMsg = `New story added successfully!`;
      res.status(201);
    }
  }
  res.type("html");
  res.render("display", {
    href: "hi",
    welcome: "Welcome " + session.userid + "!",
    p: resMsg,
  });
}

/* async del will display the HTML response for when a story is deleted from
 * the news.json file. del will also send any errors messages depending
 * on client input.
 */
async function del(res, resMsg, input, del) {
  // Notify client if a required field was not entered and set status to 400
  if (input === false) {
    resMsg = `Required Key: "` + resMsg + `" not present in sent blueprint`;
    res.status(405);
  } else {
    // Validate and delete a story
    var str = await newsService.deleteStory(del, fs);

    // if str is true (story exists)
    if (str === true) {
      // display success message and set status to 201
      resMsg = `The story was deleted successfully!`;
      res.status(201);
      // else str is fale (story does not exist)
    } else {
      // display error message and set status to 400
      resMsg = `Invalid input`;
      res.status(400);
    }
  }
  res.type("html");
  res.render("display", {
    welcome: "Welcome " + session.userid + "!",
    p: resMsg,
  });
}

/* async collect will display the HTML response for when a search is performed.
 * collect will also send any errors messages depending on client input.
 */
async function collect(res, resMsg, input, search) {
  // Notify client if a required field was not entered and set status to 400
  res.type("html");
  if (input === false) {
    resMsg = `Required Key: "` + resMsg + `" not present in sent blueprint`;
    res.status(400);
    res.render("display", {
      welcome: "Welcome " + session.userid + "!",
      p: resMsg,
    });
  } else {
    // Validate and return a list that matches the search entered
    var str = await newsService.collect(search);

    // create succesful message
    resMsg = `The following stories match your search:`;

    // if str is a string (search does not exist)
    if (typeof str === "string") {
      // display error message and set status to 400
      res.status(400);
      res.render("display", {
        welcome: "Welcome " + session.userid + "!",
        p: str,
      });
      // else search exists
    } else {
      var temp = [];
      // traverse through str and display the returned search
      for (let i = 0; i < str.length; i++) {
        temp.push(JSON.stringify(str[i]));
      }

      // set status to 201
      res.status(201);

      // set error message
      if (temp.length === 0) {
        resMsg = `There are no items that match your search.`;
        res.status(400);
      }

      res.render("collect", {
        welcome: "Welcome " + session.userid + "!",
        p: resMsg,
        array: temp,
      });
    }
  }
}

/* Create the variables and functions for NewsService object
 */
function NewsService(file) {
  const fs = require("fs");

  // Read the file to initialize this.file and this.articles
  readFile()
    .then((result) => {
      this.file = result;
      this.articles = this.file.NEWS.ARTICLE;
    })
    .catch((err) => console.error("readFile()) failed", err));

  /* readFile will read the news.json file
   */
  function readFile() {
    return new Promise((resolve) => {
      fs.readFile("./news.json", function (err, data) {
        if (err) {
          console.log("Unable to read file");
        }
        resolve(JSON.parse(data.toString()));
      });
    });
  }

  /* check if news.json exists. resolve(false) if it does not exist and
   * resolve(true) if it does exist
   */
  async function exists(data) {
    return new Promise((resolve) => {
      fs.access("./news.json", fs.F_OK, (err) => {
        if (err) {
          resolve(false);
          console.log("File does not exist");
        } else {
          resolve(true);
        }
      });
    });
  }

  /* writeNewStory is used to retrieve information from the client
   * to create and add a new story.
   */
  this.writeNewStory = async function (newStory, fs) {
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

    // asign ret to async writeFile function output
    var ret = await writeFile(
      check,
      fs,
      this.file,
      this.file.NEWS.ARTICLE,
      newStory
    )
      .then((result) => {
        // return result based on what async writeFile returns
        return result;
      })
      .catch((err) => console.error("writeFile() failed"));

    // return ret
    return ret;
  };

  /* async writeFile returns the output of check based on whether or not the story
   * exists.
   */
  async function writeFile(check, fs, file, article, newStory) {
    // if does not exist, add it to news.json
    if (check === false) {
      // add the new article
      article.push(newStory);

      // write the new JSON object to news.json
      await fs.writeFile(
        "./news.json",
        JSON.stringify(file, null, 4),
        { flag: "w+" },
        (err) => {
          if (err) throw err;
        }
      );
    }

    // return check
    return check;
  }

  /* deleteStory will validate if a given story exists and delete
   * accordingly.
   */
  this.deleteStory = async function (story, fs) {
    // story needs to be a number
    story = parseInt(story);

    // decrement story to adjust to element values
    story--;

    // use check to check for existence of story
    var check = false;

    // if the number (story) provided is within range
    if (this.articles.length > story && story >= 0) {
      // delete article at element story
      this.articles.splice(story, 1);
      check = true;
    }

    // set ret to deleteStory output
    var ret = await deleteStory(check, fs, this.file)
      .then((result) => {
        // return result based on async deleteStory
        return result;
      })
      .catch((err) => console.error("deleteStory() failed"));

    // return ret
    return ret;
  };

  /* async deleteStory returns the output of check based on whether or not the
   * story was deleted.
   */
  async function deleteStory(check, fs, file) {
    // if story was deleted, update news.json
    if (check === true) {
      await fs.writeFile(
        "./news.json",
        JSON.stringify(file, null, 4),
        { flag: "w+" },
        (err) => {
          if (err) throw err;
        }
      );
    }

    // return check
    return check;
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
        this.articles[i].TITLE.includes(collection) ||
        collection === this.articles[i].DATE ||
        collection === this.articles[i].AUTHOR
      ) {
        collect.push(this.articles[i]);
      }
    }

    // if collect array is not empty, output the list of matches
    if (collect.length > 0) {
      // return collect
      return collect;
      // else return error message
    } else {
      return "There are no stories that match your search.";
    }
  };
}

var styles = `<style>
html,body {
  height: 100%;
}

html {
  display: table;
  margin: auto;
}

body {
    display: table-cell;
    vertical-align: middle;
    font-size: 36px;
    color: #081f37;
}

label {
  font-size: .7em;
}

.button {
  background-color: #5fc9f3;
  color: #1D438A;
  width: 30%;
  font-size: 0.7em;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 0.7em;
  font-family: sans-serif;
  min-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #081f37;
}

table thead tr {
  background-color: #5fc9f3;
  color: #081f37;
  text-align: left;
}

table th, table td {
  padding: 12px 15px;
  text-align: center;
}

table tbody tr {
  border-bottom: 1px solid #dddddd;
}

table tbody tr:nth-of-type(even) {
    background-color: #f3f3f3;
}

table tbody tr:last-of-type {
  border-bottom: 1px solid #081f37;
}

.article {
  font-size: 0.7em;
}
</style>`;
