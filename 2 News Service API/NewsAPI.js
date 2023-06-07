// Instantiate newService object
var newsService = new NewsService("./news.json");

// include url, fs
var url = require("url");
const fs = require("fs");

// include express and bodyParser
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// listen to port 3001
app.listen(3001);

/* Display the landing page.
 */
app.get("/", function (req, res) {
  // create the start of the html response
  var resBody = `<html><head><title>Simple HTTP Server</title>
  ${styles}
  </head>`;

  // Display landing page forms to client
  var resMsg = forms;

  // end HTML response
  resBody = resBody + "<body>" + resMsg + "<br></body></html>";
  res.type("html");
  res.end(resBody);
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

  // create the start of the html response
  var resBody = `<html><head><title>Simple HTTP Server</title>${styles}</head>`;
  var resMsg = "";

  // if client chose to add a new story
  if (qstr.methodType === "newStory") {
    // Display html needed to add a new story
    resMsg = htmlWrite;
    // else if client chose to update a headline
  } else if (qstr.methodType === "updateHeadline") {
    // Lists the current headlines to the client
    for (let i = 0; i < newsService.articles.length; i++) {
      resMsg +=
        `<span>Title ` +
        (i + 1) +
        `: ` +
        newsService.articles[i].TITLE +
        `</span><br><br>`;
    }

    // Display html needed to update a headline
    resMsg += htmlUpdate;
    // else if client chose to update content
  } else if (qstr.methodType === "changeContent") {
    // List the current contents to the user
    for (let i = 0; i < newsService.articles.length; i++) {
      resMsg +=
        `<span>Content ` +
        (i + 1) +
        `: ` +
        newsService.articles[i].CONTENT +
        `</span><br><br>`;
    }

    // Display html needed to update content
    resMsg += htmlContent;
    // else if client chose to delete a story
  } else if (qstr.methodType === "deleteStory") {
    // Lists the current titles to the user
    for (let i = 0; i < newsService.articles.length; i++) {
      resMsg +=
        `<span>Title ` +
        (i + 1) +
        `: ` +
        newsService.articles[i].TITLE +
        `</span><br><br>`;
    }

    // Display html needed to delete a story
    resMsg += htmlDelete;
    // else if client chose to perform a search
  } else if (qstr.methodType === "search") {
    // Display html needed to perfomr a search
    resMsg = htmlSearch;
  }

  // end HTML response
  resBody = resBody + "<body>" + resMsg + "\n</body></html>";
  res.type("html");
  res.end(resBody);
});

/* /searching will take the client's input from the search form and will get
 * information from the server to display to the client.
 */
app.get("/searching", function (req, res) {
  // parse the url
  let urlObj = url.parse(req.url, true, false);
  // qstr will hold the query
  let qstr = urlObj.query;

  // create the start of the html response
  var resBody = `<html><head><title>Simple HTTP Server</title>${styles}</head>`;
  var resMsg = "";

  // Notify client that the search field is empty and it's required
  if (qstr.search === "") {
    resMsg = '"search"';
    collect(res, resBody, resMsg, false, null, null);
    // else send the search string to collect() and display appropriate message
  } else {
    collect(res, resBody, resMsg, true, qstr.search);
  }
});

/* /newStory will take client input and add a new story to the news.json file.
 * If client provides invalid inputs, /newStory will display appropriate
 * error messages to client.
 */
app.post("/newStory", function (req, res) {
  // create the start of the html response
  var resBody = `<html><head><title>Simple HTTP Server</title>${styles}</head>`;
  var resMsg = "";

  // Notify client that the title field is empty and it's required
  if (req.body.title === "") {
    resMsg = '"title"';
    addStory(res, resBody, resMsg, false);
    // Notify client that the author field is empty and it's required
  } else if (req.body.author === "") {
    resMsg = '"author"';
    addStory(res, resBody, resMsg, false);
    // Notify client that the date field is empty and it's required
  } else if (req.body.date === "") {
    resMsg = '"date"';
    addStory(res, resBody, resMsg, false);
    // Notify client that the type field is empty and it's required
  } else if (req.body.type === "") {
    resMsg = '"type"';
    addStory(res, resBody, resMsg, false);
    // Notify client that the content field is empty and it's required
  } else if (req.body.content === "") {
    resMsg = '"content"';
    addStory(res, resBody, resMsg, false);
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
    addStory(res, resBody, resMsg, true);
  }
});

/* /updateHeadline will take client input and update a headline to the news.json file.
 * If client provides invalid inputs, /updateHeadline will display appropriate
 * error messages to client.
 */
app.post("/updateHeadline", function (req, res) {
  // create the start of the html response
  var resBody = `<html><head><title>Simple HTTP Server</title>${styles}</head>`;
  var resMsg = "";

  // Notify client that the oldTitle field is empty and it's required
  if (req.body.oldTitle === "") {
    resMsg = '"oldTitle"';
    newHeadlineUpdate(res, resBody, resMsg, false, null, null);
    // Notify client that the newTitle field is empty and it's required
  } else if (req.body.newTitle === "") {
    resMsg = '"newTitle"';
    newHeadlineUpdate(res, resBody, resMsg, false, null, null);
    // Notify client whether or not the headline will be updated or not
  } else {
    newHeadlineUpdate(
      res,
      resBody,
      resMsg,
      true,
      req.body.oldTitle,
      req.body.newTitle
    );
  }
});

/* /changeContent will take client input and change the content to the news.json file.
 * If client provides invalid inputs /changeContent will display appropriate
 * error messages to client.
 */
app.post("/changeContent", function (req, res) {
  // create the start of the html response
  var resBody = `<html><head><title>Simple HTTP Server</title>${styles}</head>`;
  var resMsg = "";

  // Notify client that the oldContent field is empty and it's required
  if (req.body.oldContent === "") {
    resMsg = '"oldContent"';
    newContentUpdate(res, resBody, resMsg, false, null, null);
    // Notify client that the newContent field is empty and it's required
  } else if (req.body.newContent === "") {
    resMsg = '"newContent"';
    newContentUpdate(res, resBody, resMsg, false, null, null);
    // Notify client whether the content will be updated or not
  } else {
    newContentUpdate(
      res,
      resBody,
      resMsg,
      true,
      req.body.oldContent,
      req.body.newContent
    );
  }
});

/* /deleteStory will take client input and delete a new story from the news.json file.
 * If client provides invalid inputs, /deleteStory will display appropriate
 * error messages to client.
 */
app.post("/deleteStory", function (req, res) {
  // create the start of the html response
  var resBody = `<html><head><title>Simple HTTP Server</title>${styles}</head>`;
  var resMsg = "";

  // Notify client that the delete field is empty and it's required
  if (req.body.delete === "") {
    resMsg = '"delete"';
    del(res, resBody, resMsg, false, null, null);
    // Notify client whether the story was deleted or not
  } else {
    del(res, resBody, resMsg, true, req.body.delete);
  }
});

/* async addStory will display the HTML response for when a new story is added to
 * the news.json file. addStory will also send any errors messages depending
 * on client input.
 */
async function addStory(res, resBody, resMsg, input) {
  // Notify client if a required field was not entered and set status to 400
  if (input === false) {
    resMsg =
      "<p>Required Key: " + resMsg + " not present in sent blueprint</p>";
    res.status(400);
    // else if client filled in all required fields
  } else {
    // Validate and add new story
    var str = await newsService.writeNewStory(resMsg, fs);

    // create succesful message
    resMsg = `<p>`;

    // if str is true (story already exists)
    if (str === true) {
      // add error message and set status to 400
      resMsg += `This story already exists.</p>`;
      res.status(400);
      // else story does not currently exist in news.json
    } else {
      // add success message and set status to 201
      resMsg += `New story added successfully!</p>`;
      res.status(201);
    }
  }

  // end of HTML response
  resBody = resBody + "<body>" + resMsg;
  res.type("html");
  res.end(resBody + '<br><a href="./">Home</a></body></html>');
}

/* async newHeadlineUpdate will display the HTML response for when a headline is
 * updated. newHeadlineUpdate will also send any errors messages depending client
 * client input.
 */
async function newHeadlineUpdate(
  res,
  resBody,
  resMsg,
  input,
  oldTitle,
  newTitle
) {
  // Notify client if a required field was not entered and set status to 400
  if (input === false) {
    resMsg =
      "<p>Required Key: " + resMsg + " not present in sent blueprint</p>";
    res.status(400);
  } else {
    // Validate and update headline
    var str = await newsService.updateHeadline(oldTitle, newTitle, fs);

    // create succesful message
    resMsg = `<p>`;

    // if str is "none" (the old headline does not exist so it can't be updated)
    if (str === "none") {
      // display error message and set status to 400
      resMsg += `Can not update headline because the headline you wish to update does not exist.</p>`;
      res.status(400);
      // else if str is "match" (old headline already exists and new headline is the same)
    } else if (str === "match") {
      // display error message and set status to 400
      resMsg += `The current headline matches the new headline provided, no update was made.</p>`;
      res.status(400);
      // else if str is "exists" (old headline exists and new headline is different)
    } else if (str === "exists") {
      // display success message and set status to 201
      resMsg += `Headline was updated successfully!</p>`;
      res.status(201);
    }
  }

  // end of HTML response
  resBody = resBody + "<body>" + resMsg;
  res.type("html");
  res.end(resBody + '<br><a href="./">Home</a></body></html>');
}

/* async newContentUpdate will display the HTML response for when a content is
 * updated. newContentUpdate will also send any errors messages depending client
 * client input.
 */
async function newContentUpdate(
  res,
  resBody,
  resMsg,
  input,
  oldContent,
  newContent
) {
  // Notify client if a required field was not entered and set status to 400
  if (input === false) {
    resMsg =
      "<p>Required Key: " + resMsg + " not present in sent blueprint</p>";
    res.status(400);
  } else {
    // Validate and update content
    var str = await newsService.changeContent(oldContent, newContent, fs);

    // create succesful message
    resMsg = `<p>`;

    // if str is "none" (the old content does not exist so it can't be updated)
    if (str === "none") {
      // display error message and set status to 400
      resMsg += `Can not update content because the content you wish to update does not exist.</p>`;
      res.status(400);
      // else if str is "match" (old content already exists and new content is the same)
    } else if (str === "match") {
      // display error message and set status to 400
      resMsg += `The current content matches the new content provided, no update was made.</p>`;
      res.status(400);
      // else if str is "exists" (old content exists and new content is different)
    } else if (str === "exists") {
      // display success message and set status to 201
      resMsg += `Content was updated successfully!</p>`;
      res.status(201);
    }
  }

  // end of HTML response
  resBody = resBody + "<body>" + resMsg;
  res.type("html");
  res.end(resBody + '<br><a href="./">Home</a></body></html>');
}

/* async del will display the HTML response for when a story is deleted from
 * the news.json file. del will also send any errors messages depending
 * on client input.
 */
async function del(res, resBody, resMsg, input, del) {
  // Notify client if a required field was not entered and set status to 400
  if (input === false) {
    resMsg =
      "<p>Required Key: " + resMsg + " not present in sent blueprint</p>";
    res.status(405);
  } else {
    // Validate and delete a story
    var str = await newsService.deleteStory(del, fs);

    // create succesful message
    resMsg = `<p>`;

    // if str is true (story exists)
    if (str === true) {
      // display success message and set status to 201
      resMsg += `The story was deleted successfully!</p>`;
      res.status(201);
      // else str is fale (story does not exist)
    } else {
      // display error message and set status to 400
      resMsg += `Invalid input</p>`;
      res.status(400);
    }
  }

  // end of HTML response
  resBody = resBody + "<body>" + resMsg;
  res.type("html");
  res.end(resBody + '<br><a href="./">Home</a></body></html>');
}

/* async collect will display the HTML response for when a search is performed.
 * collect will also send any errors messages depending on client input.
 */
async function collect(res, resBody, resMsg, input, search) {
  // Notify client if a required field was not entered and set status to 400
  if (input === false) {
    resMsg =
      "<p>Required Key: " + resMsg + " not present in sent blueprint</p>";
    res.status(400);
  } else {
    // Validate and return a list that matches the search entered
    var str = await newsService.collect(search);

    // create succesful message
    resMsg = `<p>The following stories match your search:<br>`;

    // if str is a string (search does not exist)
    if (typeof str === "string") {
      // display error message and set status to 400
      resMsg = `<p>` + str;
      res.status(400);
      // else search exists
    } else {
      // traverse through str and display the returned search
      for (let i = 0; i < str.length; i++) {
        resMsg +=
          `<div class="article">Article ` +
          (i + 1) +
          `:<br>` +
          JSON.stringify(str[i], null, "<br>&emsp;") +
          "</div><br>";
      }

      // set status to 201
      res.status(201);

      // set error message
      if (str.length === 0) {
        resMsg = `<p>There are no items that match your search.`;
        res.status(400);
      }
    }
    resMsg += `</p>`;
  }

  // end of HTML response
  resBody = resBody + "<body>" + resMsg;
  res.type("html");
  res.end(resBody + '<a href="./">Home</a></body></html>');
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

  /* updateHeadline takes an existing headline (if provided) and a new headline to update
   * a headline.
   */
  this.updateHeadline = async function (headline, newHeadline, fs) {
    // headline needs to be a number
    headline = parseInt(headline);

    if (isNaN(headline)) {
      check = "none";
    } else {
      // decrement number to adjust to element values
      headline--;

      // use check to check the existence of a headline
      var check;

      // set check to "none" the old headline is not in range
      if (this.articles.length <= headline || headline < 0) {
        check = "none";
        // else check if headline exists or if newHeadline won't change the current headline
      } else {
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
    }

    // asign ret to async updateHeadline output
    var ret = await updateHeadline(check, fs, this.file)
      .then((result) => {
        // return result based on async updateHeadline output
        return result;
      })
      .catch((err) => console.error("updateHeadline() failed"));

    // return ret
    return ret;
  };

  /* async updateHeadline returns the output of check based on whether or not the
   * headline exists.
   */
  async function updateHeadline(check, fs, file) {
    // if headline exists and new headline is different
    if (check === "exists") {
      // update the JSON file
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

  /* changeContent takes an existing content (if provided) and a new content to update
   * content.
   */
  this.changeContent = async function (content, newContent, fs) {
    // content needs to be a number
    content = parseInt(content);

    if (isNaN(content)) {
      check = "none";
    } else {
      // decrement content to adjust to element values
      content--;

      // use check to check for existence of content
      var check;

      // set check to "none" if content value is not in range
      if (this.articles.length <= content || content < 0) {
        check = "none";
        // else check if content exists or if newContent won't change the current content
      } else {
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
    }

    // assign ret to async changeContent output
    var ret = await changeContent(check, fs, this.file)
      .then((result) => {
        // return result based on async changeContent
        return result;
      })
      .catch((err) => console.error("changeContent() failed"));

    // return ret
    return ret;
  };

  /* async changeContent returns the output of check based on whether or not the
   * content exists.
   */
  async function changeContent(check, fs, file) {
    // if the content exists and new content is different
    if (check === "exists") {
      // update the JSON file
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

// html for landing page
var forms = `<h2>Please choose from the following:</h2>
<form action="getStoryInfo" method="get">
    <input type="radio" id="newStory" value="newStory" name="methodType">
    <label for="newStory">Write a new news story</label>
    <br>
    <input type="radio" id="updateHeadline" value="updateHeadline" name="methodType">
    <label for="updateHeadline">Update a news story's headline</label>
    <br>
    <input type="radio" id="changeContent" value="changeContent" name="methodType">
    <label for="changeContent">Change the content of a news story</label>
    <br>
    <input type="radio" id="deleteStory" value="deleteStory" name="methodType">
    <label for="deleteStory">Delete a news story</label>
    <br>
    <input type="radio" id="search" value="search" name="methodType">
    <label for="search">Search</label>
    <br>
    <br>
    <input class="button" type="submit" value="Submit">
</form>`;

// html for /newStory
var htmlWrite = `<form action="newStory" method="post">
    <table border="1" cols="2">
        <thead>
            <tr>
                <th>Field Name</th>
                <th>Field Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>What is the title of the new story:</td>
                <td><input type="text" name="title"></td>
            </tr>
            <tr>
                <td>Who is the author of the new story:</td>
                <td><input type="text" name="author"></td>
            </tr>
            <tr>
                <td>When was this story published:</td>
                <td><input type="date" id="date" name="date"></td>
            </tr>
            <tr>
                <td>Select the subscription type:</td>
                <td>
                    <select id="type" name="type">
                        <option value="T">Public (T)</option>
                        <option value="F">Private (F)</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Please enter the content of the new story:</td>
                <td><textarea id="content" name="content" rows="5" cols="20"></textarea></td>
            </tr>
        </tbody>
    </table>
    <br>
    <input class="button" type="submit" value="Add New Story">
    <br>
    <br>
    <a href="./">Home</a><br></body></html>
</form>`;

// html for /updateHeadline
var htmlUpdate = `<form action="updateHeadline" method="post">
    <table border="1" cols="2">
        <thead>
            <tr>
                <th>Field Name</th>
                <th>Field Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Based on these titles, enter the number of the title you wish to replace:</td>
                <td><input type="text" name="oldTitle"></td>
            </tr>
            <tr>
                <td>What should the new title of this story be:</td>
                <td><textarea id="newTitle" name="newTitle" rows="5" cols="20"></textarea></td>
            </tr>
        </tbody>
    </table>
    <br>
    <input class="button" type="submit" value="Update Headline">
    <br>
    <br>
    <a href="./">Home</a><br></body></html>
</form>`;

// html for /changeContent
var htmlContent = `<form action="changeContent" method="post">
    <table border="1" cols="2">
        <thead>
            <tr>
                <th>Field Name</th>
                <th>Field Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>What is the content of the story you wish to replace:</td>
                <td><input type="text" name="oldContent"></td>
            </tr>
            <tr>
                <td>What should the new content of this story be:</td>
                <td><textarea id="newContent" name="newContent" rows="5" cols="20"></textarea></td>
            </tr>
        </tbody>
    </table>
    <br>
    <input class="button" type="submit" value="Change Content">
    <br>
    <br>
    <a href="./">Home</a><br></body></html>
</form>`;

// html for /deleteStory
var htmlDelete = `<form action="deleteStory" method="post">
    <table border="1" cols="2">
        <thead>
            <tr>
                <th>Field Name</th>
                <th>Field Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Based on these titles, enter the number of the story you wish to delete:</td>
                <td><input type="text" name="delete"></td>
            </tr>
        </tbody>
    </table>
    <br>
    <input class="button" type="submit" value="Delete Story">
    <br>
    <br>
    <a href="./">Home</a><br></body></html>
</form>`;

// html for /searching
var htmlSearch = `<form action="searching" method="get">
    <table border="1" cols="2">
        <thead>
            <tr>
                <th>Field Name</th>
                <th>Field Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Enter a substring of a title, date range, or the name of an author to search:</td>
                <td><input type="text" name="search"></td>
            </tr>
        </tbody>
    </table>
    <br>
    <input class="button" type="submit" value="Search">
    <br>
    <br>
    <a href="./">Home</a><br></body></html>
</form>`;

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
    color: #f8f9fa;
    background-color: #212529;
}

label {
  font-size: .7em;
}

.button {
  background-color: #f8f9fa;
  color: #212529;
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
  border: 1px solid #f8f9fa;
}

table thead tr {
  background-color: #212529;
  color: #f8f9fa;
  text-align: left;
}

table th, table td {
  padding: 12px 15px;
  text-align: center;
}

table tbody tr {
  border-bottom: 1px solid #dee2e6;
}

table tbody tr:nth-of-type(odd) {
    background-color: #495057;
}

table tbody tr:last-of-type {
  border-bottom: 1px solid #dee2e6;
}

.article {
  font-size: 0.7em;
}

h2, h4 {
  margin: 0;
}

br {
  font-size: 0.7em;
}

span {
  font-size: 0.7em;
}

a:link {
  color: #f8f9fa;
}

a:visited {
  color: #dee2e6;
}

a:hover {
  color: #e9ecef;
}

a:active {
  color: #f8f9fa;
}
</style>`;
