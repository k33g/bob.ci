require('shelljs/global');
const fs = require("fs");
const uuid = require('uuid');
const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const GitHubClient = require('./GitHubClient.js').GitHubClient;

let port = process.env.EXPRESS_PORT;
let selfUrl = process.env.URL_SERVER
let urlBot = process.env.URL_BOT

let githubCli = new GitHubClient({
  baseUri: "https://api.github.com",
  token: process.env.TOKEN_INDY_THE_BOT
})

let postData = ({path, data}) => {
  return fetch(path, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => {
    return response.json()
  })
  .then(jsonData => {
    return jsonData;
  })
}

let app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static('clones'));

app.post('/cd', (req, res) => {
  console.log("#################################");
  console.log(req.body);
  postData({path:`${urlBot}`, data: {message:`👏 🐼 ✨ 🍾 DEPLOY Successful!!!\n\n`}});
  console.log("#################################");
  res.status(201).end()
})

app.post('/ci', (req, res) => {

  let event = req.headers['x-github-event'];

  // pending, success, failure, error
  switch (event) {
    case "push":
      // status
      if(req.body.deleted == false) {
        let after = req.body.after;
        let owner = req.body.repository.owner.name;
        let statuses_url = `/repos/${owner}/${req.body.repository.name}/statuses/${after}`;

        let branch = req.body.ref.split("/").pop(); // perhaps an other way to get the branch name?

        if(branch!=="gh-pages") {

          githubCli.postData({path:statuses_url, data:{
              state: "pending"
            , description: "Hi, I'm JarvisCI :)"
            , context: "CIFaker"
            , target_url: `${selfUrl}/ci`
          }})
          .then(res => {

            // start building and testing
            let repository = req.body.repository.clone_url;
            let workdir = req.body.repository.name;

            let random_path = uuid.v4();
            let tmp_directory = `clones/${random_path}`;

            let cmd = [
                `mkdir ${tmp_directory}; `
              , `cd ${tmp_directory}; `
              , `git clone ${repository}; `
              , `cd ${workdir}; `
              , `git checkout ${branch}; `
              , `npm --cache-min 9999999 install; `
              , `npm test`
            ].join('');

            exec(cmd, (code, stdout, stderr) => {
              if(code !== 0) {
                console.error(`😡 tests 👎`);

                fs.writeFile(`${tmp_directory}-stderr.log`, stderr, (err) => {
                  if (err) { console.error(err); }
                });

                fs.writeFile(`${tmp_directory}-stdout.log.txt`, stdout, (err) => {
                   if (err) { console.error(err); }
                });

                githubCli.postData({path:statuses_url, data:{
                    state: "failure"
                  , description: "Hi, I'm BobCI :)"
                  , context: "Tiny CI server for CleverCloud Demo"
                  , target_url: `${selfUrl}/${random_path}-stdout.log.txt`
                }})
                .then(res => {
                  // foo
                })
                .catch(err => {
                  console.log(err)
                })

                // call bot, notifiy the rocket chat bot
                postData({path:`http://bobthebot.cleverapps.io/ci`, data: {message:`😡 tests on ${repository} 👎`}})

                // change status
              } else {
                console.info('😀 tests 👍')

                fs.writeFile(`${tmp_directory}-stdout.log.txt`, stdout, (err) => {
                   if (err) { console.error(err); }
                });

                githubCli.postData({path:statuses_url, data:{
                    state: "success"
                  , description: "Hi, I'm JarvisCI :)"
                  , context: "CIFaker"
                  , target_url: `${selfUrl}/${random_path}-stdout.log.txt` //TODOCHANGE THE URL  -> env
                }})
                .then(res => {
                  // foo
                })
                .catch(err => {
                  console.log(err)
                })


                // call bot, notifiy the rocket chat bot
                postData({path:`${urlBot}`, data: {message:`😀 tests on ${repository} 👍`}})

                // change status
              }

              exec(`rm -rf ${tmp_directory}`)

            })

          })
          .catch(err => {
            console.log(err)
          })
        } // end if: branch!==gh-pages

      } // end if: if(req.body.deleted == false)
      break;
    case "pull_request":
      let action = req.body.action;

      //if(action=="opened") { }
      if(action=="closed") {
        // you can deploy
        let merged = req.body.pull_request !== undefined ? req.body.pull_request.merged : undefined;
        if(merged) {
          // notifiy the bot
          postData({path:`${urlBot}`, data: {message:`👍 A pull request was merged! A deployment should start now...\n\n`}})
        }
      }
      break;
    default:
      // ....
      break;
  }
  res.status(201).end() // 201?
  //res.json({})
})

app.listen(port)
console.log(`🚀 CI Server is started - listening on ${port}`)
// notifiy the bot
postData({path:`${urlBot}`, data: {message:`🚀 CI Server is started - listening on ${port}\n\n`}})
