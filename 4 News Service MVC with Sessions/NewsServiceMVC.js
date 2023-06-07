/* Create the variables and functions for NewsService object
 */
class NewsService {
  constructor(file) {
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
      // use check to check for existence of story
      var check = false;

      for (let i = 0; i < this.articles.length; i++) {
        // console.log(i);
        // console.log(story);
        // console.log(i === story);
        if (i === JSON.parse(story)) {
          // delete article at element story
          this.articles.splice(i, 1);
          check = true;
        }
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
     * for stories that match a given title in order to display the article
     * to the client.
     */
    this.collect = function (collection) {
      // collect is an empty array
      var collect = new Array();

      // Search through stories and add them to collect array if there's a match
      for (let i = 0; i < this.articles.length; i++) {
        if (JSON.stringify(this.articles[i].TITLE) === collection) {
          collect.push(this.articles[i]);
        }
      }

      // if collect array is not empty, output the list of matches
      if (collect.length > 0) {
        // return collect
        return collect;
        // else return error message
      } else {
        return "There are no articles available at the moment.";
      }

      // return collect
      return collect;
    };
  }
}

// Instantiate newService object
var newsService = new NewsService("./news.json");

// include url, fs
var url = require("url");
const fs = require("fs");

// include express, body-parser
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
    cookie: { expires: new Date(Date.now() + 600000) },
    saveUninitialized: false,
  })
);

var session;

// create username and passwords for a sub and reporter
const subUsername = "Brandon";
const subPassword = "Subscriber";
const repUsername = "Igor";
const repPassword = "Reporter";

// empty list used to display a list after logging out
var list = [];

// listen to port 3003
app.listen(3003);

// set views and pug
app.set("views", "./views");
app.set("view engine", "pug");

// Initialize variables used to start program as a Guest
var username = "Guest";
var role = "Guest";
var welcome = "Welcome Guest!";
var display = "display";
var collectPug = "collect";
var index = "guest index";

/* Set correct user variables depending on rolls to display
 * correct landing page
 */
app.get("/", function (req, res, next) {
  if (role === "Guest") {
    req.session.authenticated = false;
  }

  // if session.userid exists
  if (req.session.authenticated) {
    // set username variables to session.userid
    username = session.userid;

    // if Subscriber logged in, set appropriate variables
    if (role === "Subscriber") {
      index = "subscriber index";
      welcome = "Logged in as a " + role + ". Welcome " + username + "!";
      // call landingPage() to display Subscriber's landing page
      landingPage(res);
      // else set variables to match a Reporter's login
    } else {
      index = "reporter index";
      welcome = "Logged in as a " + role + ". Welcome " + username + "!";
      // call landingPage() to display Reporter's landing page
      landingPage(res);
    }
    // else reset variables to match Guest
  } else {
    req.session.destroy();
    username = "Guest";
    role = "Guest";
    welcome = "Welcome Guest!";
    display = "display";
    collectPug = "collect";
    index = "guest index";

    // call landingPage() to display Guest's landing page
    landingPage(res);
  }
});

/* Display the login page. */
app.get("/login", function (req, res) {
  // Display login.pug
  res.render("login");
});

/* Create a session and set userid to login. Redirect to landing page or
 * display the invalid login page.
 */
app.post("/login", function (req, res) {
  // Notify client that the login field is empty and it's required to login
  if (req.body.username === "") {
    res.status(400);
    res.render(display, {
      p: `Required Key: "username" not present in sent blueprint`,
    });
    // Notify client that the password field is empty and it's required to login
  } else if (req.body.password === "") {
    res.status(400);
    res.render(display, {
      p: `Required Key: "password" not present in sent blueprint`,
    });
    // Notify client that the password field is empty and it's required to login
  } else if (
    req.body.userType === undefined &&
    req.body.userType === undefined
  ) {
    res.status(400);
    res.render(display, { p: `Invalid input: A role was not selected.` });
    // if request payloads match the username and password for subscriber, login as Subscriber
  } else if (
    req.body.username === subUsername &&
    req.body.password === subPassword &&
    req.body.userType === "subscriber"
  ) {
    // reset list to empty
    list = [];

    // set session info and variables to match Subscriber role
    session = req.session;
    session.authenticated = true;
    session.userid = req.body.username;
    role = "Subscriber";
    display = "display with logout";
    collectPug = "collect with logout";
    console.log("Subscriber session created: " + req.session.cookie);

    // start the list
    list.push("Activity for " + role + " " + session.userid);
    list.push("- Logged in");

    // redirect to landing page
    res.redirect("/");
    // else if request payloads match the username and password for reporter, login as Reporter
  } else if (
    req.body.username === repUsername &&
    req.body.password === repPassword &&
    req.body.userType === "reporter"
  ) {
    // reset list to empty
    list = [];

    // set session info and variables to match Reporter role
    session = req.session;
    session.authenticated = true;
    session.userid = req.body.username;
    role = "Reporter";
    display = "display with logout";
    collectPug = "collect with logout";
    console.log("Reporter session created: " + req.session.cookie);

    // start the list
    list.push("Activity for " + role + " " + session.userid);
    list.push("- Logged in");

    // redirect to landing page
    res.redirect("/");
  } else {
    res.status(400);
    // render invalid login page
    res.render("invalid login");
  }
});

/* Destroy the session and render the logout page which also lists the tracked activities
 * made while logged in as a Subscriber/Reporter
 */
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.clearCookie("connect.sid");
  console.log("Session destroyed");
  res.render("logout", {
    h2: "Please come again, goodbye " + username + "!",
    array: list,
  });
});

/* Get the query string and send to collect() to display articles
 */
app.get("/article", function (req, res) {
  // parse the url
  let urlObj = url.parse(req.url, true, false);
  // qstr will hold the query
  let qstr = urlObj.query;

  collect(res, qstr.article);
});

/* Render write.pug which displays the forms to the Reporter in order to
 * add a new story."
 */
app.get("/getStoryInfo", function (req, res) {
  // Display write.pug
  res.render("write", { welcome: welcome });
});

/* /newStory will take client input and add a new story to the news.json file.
 * If client provides invalid inputs, /newStory will display appropriate
 * error messages to client with the help of addStory()
 */
app.post("/newStory", function (req, res) {
  // use resMsg to add to output string
  var resMsg = "";

  // Notify client that the title field is empty and it's required
  if (req.body.title === "") {
    resMsg = `title`;
    addStory(res, resMsg, false);
    // Notify client that the date field is empty and it's required
  } else if (req.body.date === "") {
    resMsg = `date`;
    addStory(res, resMsg, false);
    // Notify client that the public type field is empty and it's required
  } else if (req.body.type === "") {
    resMsg = `type`;
    addStory(res, resMsg, false);
    // Notify client that the content field is empty and it's required
  } else if (req.body.content === "") {
    resMsg = `content`;
    addStory(res, resMsg, false);
    // Notify client whether the story will be added or not
  } else {
    // create date variable to display the entered date in dd/mm/yyyy format
    var year = req.body.date.slice(0, 4);
    var day = req.body.date.slice(5, 7);
    var month = req.body.date.slice(8, 10);
    var date = day + "-" + month + "-" + year;

    // Create a JSON object based on client's input
    resMsg = {
      TITLE: req.body.title,
      AUTHOR: repUsername,
      DATE: date,
      PUBLIC: req.body.type,
      CONTENT: req.body.content,
    };

    // call addStory to add the new story
    addStory(res, resMsg, true);
  }
});

/* /deleteStory will take client input and delete a new story from the news.json
 * with the help of del()
 */
app.post("/deleteStory", function (req, res) {
  var articleIndex = Object.keys(req.body)[0];

  // call del() to perform delete and page render
  del(res, newsService.articles[articleIndex].PUBLIC, articleIndex);
});

/* async addStory will either set an invalid error or send a JSON object to
 * newsService.writeNewStory() which will add a new story to news.json and
 * set a success message. addStory will also add an activity to the Reporter's
 * activity list and render the invalid or success message.
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
      // else story did not exist in news.json
    } else {
      // create and add activity to the Reporter's list
      var type = "public";
      if (resMsg.PUBLIC === "F") {
        type = "private";
      }
      list.push(`- Added the new ` + type + ` story: "` + resMsg.TITLE + `"`);

      // add success message and set status to 201
      resMsg = `New story added successfully!`;
      res.status(201);
    }
  }
  // render invalid/success display to client
  res.type("html");
  res.render(display, { welcome: welcome, p: resMsg });
}

/* async del() will send an article's title to newsService.deleteStory() to
 * delete an article from the news.json file. Since a delete button can
 * only exist under certain conditions, no invalid messages will be
 * created. After deleting a story, del() will add the activity to the
 * Reporter's list and render a success message to the client.
 */
async function del(res, type, del) {
  // Validate and delete a story
  var str = await newsService.deleteStory(del, fs);

  // add success message and set status to 201
  resMsg = `The story was deleted successfully!`;

  res.status(201);

  var typeWritten = "Public";

  if (type === "F") {
    typeWritten = "Private";
  }

  // create and add a deleted activity to the Reporter's activity list
  list.push(`- Deleted the ${typeWritten} (${type}) article: ${del}`);

  // render a success display to the client
  res.type("html");
  res.render(display, { welcome: welcome, p: resMsg });
}

/* async collect will render a selected article to the client depending
 * on an article's hyperlink that is clicked from the landing page.
 */
async function collect(res, article) {
  // Validate and return an article
  var str = await newsService.collect(article);

  // create succesful message and set status to 201
  var resMsg = `You are now reading:`;
  res.status(201);

  // create and add activity to Subscriber/Reporter's activity list
  if (role === "Subscriber" || role === "Reporter") {
    var type = "public";
    if (str[0].PUBLIC === "F") {
      type = "private";
    }
    list.push("- Read the " + type + ` article: "` + str[0].TITLE + `"`);
  }

  // render an article to the client
  res.render(collectPug, {
    welcome: welcome,
    p: resMsg,
    title: str[0].TITLE,
    author: str[0].AUTHOR,
    date: str[0].DATE,
    public: str[0].PUBLIC,
    content: str[0].CONTENT,
  });
}

/* landingPage() is used to create and render a list of articles
 * with hyperlinks and delete buttons depending on the client's
 * current role.
 */
async function landingPage(res) {
  // set variables and lists that are used to help pug render
  var str = newsService.articles;
  var temp = [];
  var set = [];
  var href = [];
  var canDelete = [];
  var deleteButton = [];
  // Lists the current titles to the client
  for (let i = 0; i < str.length; i++) {
    // add hyperlinks to public articles for Guest
    if (role === "Guest" && str[i].PUBLIC === "T") {
      temp.push(JSON.stringify(str[i].TITLE));
      set.push(true);
      href.push("/article?article=" + JSON.stringify(str[i].TITLE));
      // add hyperlinks to public and private articles for Subscriber
    } else if (
      role === "Subscriber" &&
      (str[i].PUBLIC === "T" || str[i].PUBLIC === "F")
    ) {
      temp.push(JSON.stringify(str[i].TITLE));
      set.push(true);
      href.push("/article?article=" + JSON.stringify(str[i].TITLE));
      // add hyperlinks and delete buttons to articles for Reporter
    } else if (role === "Reporter") {
      temp.push(JSON.stringify(str[i].TITLE));

      if (str[i].PUBLIC === "T" || str[i].AUTHOR === repUsername) {
        set.push(true);
        href.push("/article?article=" + JSON.stringify(str[i].TITLE));
      } else {
        set.push(false);
      }
      //   console.log(str[i].AUTHOR);
      //   console.log(repUsername);
      //   console.log(str[i].AUTHOR === repUsername);
      if (str[i].AUTHOR === repUsername) {
        deleteButton[i] = true;
        // href.push("/article?article=" + JSON.stringify(str[i].TITLE));
        canDelete.push(
          "/delete?delete=" +
            JSON.stringify(str[i].TITLE) +
            "&public=" +
            JSON.stringify(str[i].PUBLIC)
        );
      } else {
        deleteButton[i] = false;
      }
      // else add the article without a hyperlink
    } else {
      set[i] = false;
      temp.push(JSON.stringify(str[i].TITLE));
    }
  }

  //   console.log(deleteButton);

  // render the landing page to client
  res.type("html");
  res.render(index, {
    welcome: welcome,
    array: temp,
    set: set,
    href: href,
    canDelete: canDelete,
    deleteButton: deleteButton,
  });
}
