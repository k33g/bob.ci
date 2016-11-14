//"use strict";
const fetch = require('node-fetch');
// https://github.com/bitinn/node-fetch
// npm install node-fetch --save

class HttpException extends Error {
  constructor({message, status, statusText, url}) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    //Error.captureStackTrace(this, this.constructor.name)
  }
}

class GitHubClient {
  constructor({baseUri, token}) {
    this.baseUri = baseUri
    this.credentials = token !== null && token.length > 0 ? "token" + ' ' + token : null
    this.headers = {
      "Content-Type": "application/json",
      "Accept": "application/vnd.github.v3.full+json",
      "Authorization": this.credentials
    }
  }

  // octocat mindset
  octocat() {
    let _response = {}
    return fetch(this.baseUri + `/octocat`, {
      method: 'GET',
      headers: this.headers
    })
    .then(response => {
      if (response.ok) {
        return response.text()
      } else {
        throw new HttpException({
          message: "HttpException",
          status:response.status,
          statusText:response.statusText,
          url: response.url
        });
      }
    })
  }

  getData({path}) {
    let _response = {}
    return fetch(this.baseUri + path, {
      method: 'GET',
      headers: this.headers
    })
    .then(response => {
      // save reference of response / then we can access to headers
      _response = response
      // if response is ok transform response.text to json object
      // else throw error
      if (response.ok) {
        return response.json()
      } else {
        throw new HttpException({
          message: "HttpException",
          status:response.status,
          statusText:response.statusText,
          url: response.url
        });
      }
    })
    .then(jsonData => {
      // add json data to _response
      _response.data = jsonData;
      return _response;
    })
  }

  deleteData({path}) {
    let _response = {}
    return fetch(this.baseUri + path, {
      method: 'DELETE',
      headers: this.headers
    })
    .then(response => {
      // save reference of response / then we can access to headers
      _response = response
      // if response is ok transform response.text to json object
      // else throw error
      if (response.ok) {
        return response.json()
      } else {
        throw new HttpException({
          message: "HttpException",
          status:response.status,
          statusText:response.statusText,
          url: response.url
        });
      }
    })
    .then(jsonData => {
      // add json data to _response
      _response.data = jsonData;
      return _response;
    })
  }

  postData({path, data}) {
    let _response = {}
    return fetch(this.baseUri + path, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    })
    .then(response => {
      _response = response
      // if response is ok transform response.text to json object
      // else throw error
      if (response.ok) {
        return response.json()
      } else {
        throw new HttpException({
          message: "HttpException",
          status:response.status,
          statusText:response.statusText,
          url: response.url
        });
      }
    })
    .then(jsonData => {
      _response.data = jsonData;
      return _response;
    })
  }

  putData({path, data}) {
    let _response = {}
    return fetch(this.baseUri + path, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data)
    })
    .then(response => {
      _response = response
      // if response is ok transform response.text to json object
      // else throw error
      if (response.ok) {
        return response.json()
      } else {
        throw new HttpException({
          message: "HttpException",
          status:response.status,
          statusText:response.statusText,
          url: response.url
        });
      }
    })
    .then(jsonData => {
      _response.data = jsonData;
      return _response;
    })
  }

  searchCode({q}) {
    return this.getData({path:`/search/code?q=${q}`})
    .then(response => {
      return response.data;
    });
  }

  // get user data
  fetchUser({handle}) {
    return this.getData({path:`/users/${handle}`})
    .then(response => {
      return response.data;
    });
  }
  //https://developer.github.com/v3/users/administration/#suspend-a-user
  suspendUser({handle}) {
    this.headers["Content-Length"] = 0;
    return fetch(this.baseUri + `/users/${handle}/suspended`, {
      method: 'PUT',
      headers: this.headers,
      body: null
    })
    .then(response => {
      delete this.headers["Content-Length"];
      return response
    })
  }

  unsuspendUser({handle}) {
    //this.headers["Content-Length"] = 0;
    return fetch(this.baseUri + `/users/${handle}/suspended`, {
      method: 'DELETE',
      headers: this.headers,
    })
    .then(response => {
      return response
    })
  }



  /*
    Repositories
    TODO:
    - fetch
    - refactoring
  */

  // GET /users/:username/repos
  fetchUserRepositories({handle}) {
    return this.getData({path:`/users/${handle}/repos`})
    .then(response => {
      return response.data;
    });
  }

  // GET /orgs/:org/repos
  fetchOrganizationRepositories({organization}) {
    return this.getData({path:`/orgs/${organization}/repos`})
    .then(response => {
      return response.data;
    });
  }

  createPublicRepository({name, description}) {
    return this.postData({path:`/user/repos`, data:{
      name: name,
      description: description,
      private: false,
      has_issue: true,
      has_wiki: true,
      auto_init: true
    }}).then(response => {
      return response.data;
    });
  }

  createPrivateRepository({name, description}) {
    return this.postData({path:`/user/repos`, data:{
      name: name,
      description: description,
      private: true,
      has_issue: true,
      has_wiki: true,
      auto_init: true
    }}).then(response => {
      return response.data;
    });
  }

  createPublicOrganizationRepository({name, description, organization}) {
    return this.postData({path:`/orgs/${organization}/repos`, data:{
      name: name,
      description: description,
      private: false,
      has_issue: true,
      has_wiki: true,
      auto_init: true
    }}).then(response => {
      return response.data;
    });
  }

  createPrivateOrganizationRepository({name, description, organization}) {
    return this.postData({path:`/orgs/${organization}/repos`, data:{
      name: name,
      description: description,
      private: true,
      has_issue: true,
      has_wiki: true,
      auto_init: true
    }}).then(response => {
      return response.data;
    });
  }

  /* Organizations
    ### Organization Administration

    #### Create an organization:

      - only for GitHub Enterprise
      - `POST /admin/organizations`
      - see https://developer.github.com/v3/enterprise/orgs/#create-an-organization

      ```
      login	string	Required. The organization's username.
      admin	string	Required. The login of the user who will manage this organization.
      profile_name	string	The organization's display name.
      ```
    TODO:
    https://developer.github.com/v3/orgs/

  */
  createOrganization({login, admin, profile_name}) {
    return this.postData({path:`/admin/organizations`, data:{
      login: login,
      admin: admin,
      profile_name: profile_name
    }}).then(response => {
      return response.data;
    });
  }

  /* Teams
    ### Teams

    #### Create a Team

    See https://developer.github.com/v3/orgs/teams/#create-team
    POST /orgs/:org/teams

    :warning: In order to create a team, the authenticated user must be a member of :org.
    -> or you have to be the administrator

  */
  createTeam({org, name, description, repo_names, privacy, permission}) {
    return this.postData({path:`/orgs/${org}/teams`, data:{
      name: name,
      description: description,
      repo_names: repo_names,
      privacy: privacy, // secret or closed
      permission: permission // pull, push, admin
    }}).then(response => {
      return response.data;
    });
  }
  // list of the teams of the organization
  // See https://developer.github.com/v3/orgs/teams/#list-teams
  fetchTeams({org}) {
    return this.getData({path:`/orgs/${org}/teams`})
    .then(response => {
      return response.data;
    });
  }

  getTeamByName({org, name}) {
    return this.fetchTeams({org:org})
    .then(teams => {
      return teams.find(team => {
        return team.name = name
      })
    })
  }

  updateTeamRepository({teamId, organization, repository, permission}) {
    return this.putData({path:`/teams/${teamId}/repos/${organization}/${repository}`, data:{
      permission: permission
    }}).then(response => {
      return response.data;
    });
  }


  // Add team membership
  // PUT /teams/:id/memberships/:username
  addTeamMembership({teamId, userName, role}) {
    return this.putData({path:`/teams/${teamId}/memberships/${userName}`, data:{
      role: role // member, maintener
    }}).then(response => {
      return response.data;
    });
  }

  addOrganizationMembership({org, userName, role}) {
    return this.putData({path:`/orgs/${org}/memberships/${userName}`, data:{
      role: role // member, maintener
    }}).then(response => {
      return response.data;
    });
  }

  /* Milestones

  */
  // GET /repos/:owner/:repo/milestones

  fetchMilestones({owner, repository}){
    return this.getData({path:`/repos/${owner}/${repository}/milestones`})
    .then(response => {
      return response.data;
    });
  }

  getMilestoneByTitle({title, owner, repository}) {
    return this.fetchTeams({org:org})
    .then(milestones => {
      return milestones.find(milestone => {
        return milestone.title = title
      })
    })
  }

  createMilestone({title, state, description, due_on, owner, repository}) {
    return this.postData({path:`/repos/${owner}/${repository}/milestones`, data:{
      title: title,
      state: state,
      description: description,
      due_on: due_on
    }}).then(response => {
      return response.data;
    });
  }

  /* Labels

  */
  createLabel({name, color, owner, repository}) {
    return this.postData({path:`/repos/${owner}/${repository}/labels`, data:{
      name: name,
      color: color
    }}).then(response => {
      return response.data;
    });
  }

  /* Issues
    TODO:
    - Edit, lock, unlock
  */



  /*
    Create an issue
    https://developer.github.com/v3/issues/#create-an-issue
  */
  createIssue({title, body, labels, milestone, assignees, owner, repository}) {
    return this.postData({path:`/repos/${owner}/${repository}/issues`, data:{
      title, body, labels, milestone, assignees, owner, repository
    }}).then(response => {
      return response.data;
    });
  }

  /*
    Get a single issue
    https://developer.github.com/v3/issues/#get-a-single-issue
    Note: In the past, pull requests and issues were more closely aligned than they are now. As far as the API is concerned, every pull request is an issue, but not every issue is a pull request.
    This endpoint may also return pull requests in the response. If an issue is a pull request, the object will include a pull_request key.
    GET /repos/:owner/:repo/issues/:number

  */
  fetchIssue({owner, repository, number}) {
    return this.getData({path:`/repos/${owner}/${repository}/issues/${number}`})
    .then(response => {
      return response.data;
    });
  }
  /*
    List issues for a repository
    https://developer.github.com/v3/issues/#list-issues-for-a-repository
    Note: In the past, pull requests and issues were more closely aligned than they are now. As far as the API is concerned, every pull request is an issue, but not every issue is a pull request.
    This endpoint may also return pull requests in the response. If an issue is a pull request, the object will include a pull_request key.
    GET /repos/:owner/:repo/issues

    TODO: next, previous
  */
  fetchIssues({owner, repository}) {
    return this.getData({path:`/repos/${owner}/${repository}/issues`})
    .then(response => {
      return response.data;
    });
  }

  // https://developer.github.com/v3/issues/comments/
  /*
    Create a commentIntegrations
    POST /repos/:owner/:repo/issues/:number/comments

    TODO: Edit
  */
  addIssueComment({owner, repository, number, body}) {
    return this.postData({path:`/repos/${owner}/${repository}/issues/${number}/comments`, data:{
      body
    }}).then(response => {
      return response.data;
    });
  }
  /*
    List comments on an issue
    https://developer.github.com/v3/issues/comments/#list-comments-on-an-issue
    GET /repos/:owner/:repo/issues/:number/comments

  */
  fetchIssueComments({owner, repository, number}) {
    return this.getData({path:`/repos/${owner}/${repository}/issues/${number}/comments`})
    .then(response => {
      return response.data;
    });
  }

  /*
    Create reaction for an issue
    https://developer.github.com/v3/reactions/#create-reaction-for-an-issue
    POST /repos/:owner/:repo/issues/:number/reactions

    +1, -1, laugh, confused, heart, hooray
  */
  addIssueReaction({owner, repository, number, content}) {
    let saveAccept = this.headers["Accept"];
    this.headers["Accept"] = "application/vnd.github.squirrel-girl-preview";
    return this.postData({path:`/repos/${owner}/${repository}/issues/${number}/reactions`, data:{
      content
    }}).then(response => {
      this.headers["Accept"] = saveAccept;
      return response.data;
    });
  }
  /*
    Create reaction for an issue comment
    POST /repos/:owner/:repo/issues/comments/:id/reactions

    +1, -1, laugh, confused, heart, hooray

  */
  addIssueCommentReaction({owner, repository, id, content}) {
    let saveAccept = this.headers["Accept"];
    this.headers["Accept"] = "application/vnd.github.squirrel-girl-preview";
    return this.postData({path:`/repos/${owner}/${repository}/issues/comments/${id}/reactions`, data:{
      content
    }}).then(response => {
      this.headers["Accept"] = saveAccept;
      return response.data;
    });
  }

  searchIssue() {

  }



  /* Commits
  */

  // Get a commit by SHA
  // GET /repos/:owner/:repo/git/commits/:sha
  fetchCommitBySHA({sha, owner, repository}){
    return this.getData({path:`/repos/${owner}/${repository}/git/commits/${sha}`})
    .then(response => {
      return response.data;
    });
  }

  // TODO: see https://developer.github.com/v3/repos/commits/#get-a-single-commit

  /* Contents
    TODO:
    - trees: https://developer.github.com/v3/git/trees/
  */

  /*
    https://developer.github.com/v3/repos/contents/#get-contents
    GET /repos/:owner/:repo/contents/:path
    let src = new Buffer(contentInformation.content, contentInformation.encoding).toString("ascii"),
        sha = contentInformation.sha;
  */
  fetchContent({path, owner, repository, decode}){
    return this.getData({path:`/repos/${owner}/${repository}/contents/${path}`})
    .then(response => {
      if(decode==true) {
        response.data.contentText = new Buffer(response.data.content, response.data.encoding).toString("ascii")
      }
      return response.data;
    });
  }

  // --- reference ---
  /*
    TODO: documentation
  */
  getReference({owner, repository, ref}){
    return this.getData({path:`/repos/${owner}/${repository}/git/refs/${ref}`})
    .then(response => {
      //console.log(response.data)
      return response.data;
    });
  }

  createReference({ref, sha, owner, repository}) {
    return this.postData({path:`/repos/${owner}/${repository}/git/refs`, data:{
      ref, sha
    }}).then(response => {
      return response.data;
    });
  }

  // --- create branch ---
  /*
  githubCli.createBranch({
      name: "wip-killer-feature-again-ping"
    , from: "master"
    , owner: "UnitedFederationOfPlanets"
    , repository: "repo-00"
  })
  */
  createBranch({branch, from, owner, repository}) {
    return this.getReference({
        owner: owner
      , repository: repository
      , ref: `heads/${from}`
    }).then(data => {
      let sha = data.object.sha
      //console.log(sha)
      return this.createReference({
          ref: `refs/heads/${branch}`
        , sha: sha
        , owner: owner
        , repository: repository
      })
    })
  }

  createBranchFromRelease({branch, from, owner, repository}) {
    return this.getReference({
        owner: owner
      , repository: repository
      , ref: `tags/${from}`
    }).then(data => {
      let sha = data.object.sha
      //console.log(sha)
      return this.createReference({
          ref: `refs/heads/${branch}`
        , sha: sha
        , owner: owner
        , repository: repository
      })
    })
  }



  // --- commit ---
  /*
    TODO: documentation + other commits features
  */
  createFile({file, content, message, branch, owner, repository}) {
    let contentB64 = (new Buffer(content)).toString('base64');
    return this.putData({path:`/repos/${owner}/${repository}/contents/${file}`, data:{
      message, branch, content: contentB64
    }}).then(response => {
      return response.data;
    });
  }

  // --- create PR ---
  /*
    TODO: documentation, add labels, milestone and assignees
  */
  // head -> branch base -> eg master
  createPullRequest({title, body, head, base, owner, repository}) {
    return this.postData({path:`/repos/${owner}/${repository}/pulls`, data:{
      title, body, head, base
    }}).then(response => {
      return response.data;
    });
  }

  // --- Enterprise ---
  fetchStats({type}){
    return this.getData({path:`/enterprise/stats/${type}`})
    .then(response => {
      return response.data;
    });
  }
  // --- Create Hook ---
  createHook({owner, repository, hookName, hookConfig, hookEvents, active}) {
    return this.postData({path:`/repos/${owner}/${repository}/hooks`, data:{
        name: hookName
      , config: hookConfig
      , events: hookEvents
      , active: active
    }}).then(response => {
      return response.data;
    });
  }
  // organization hook
  createOrganizationHook({org, hookName, hookConfig, hookEvents, active}) {
    return this.postData({path:`/orgs/${org}/hooks`, data:{
        name: hookName
      , config: hookConfig
      , events: hookEvents
      , active: active
    }}).then(response => {
      return response.data;
    });
  }


} // end of class


//module.exports = GitHubClient
module.exports = {
  GitHubClient: GitHubClient
}
