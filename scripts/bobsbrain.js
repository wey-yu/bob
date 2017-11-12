// Description:
//   <description of the scripts functionality>
//   this is my clever bot
'use strict';

let getInfosWhenEvent = (req) => {
  return {
      event: req.headers['x-github-event']
    , action: req.body.action
    , owner: req.body.repository.owner.login
    , repository_name: req.body.repository.name
    , sender: req.body.sender
    , issue: req.body.issue
    , comment: req.body.comment
  }
}

module.exports =  (robot) =>  {

  robot.messageRoom(process.env.GENERAL_ROOM, 'Hello 🌍 I am IndyTheBot')
  
  robot.hear(/hello bob/, (res) => {
    res.send(`hi ${res.message.user.name}`);
  });

  robot.hear(/hi|hey|yo/i, (res) => {
    res.send(`👋 ${res.message.user.name}`);
  });

  // ok bob how are you doing?
  robot.hear(/(?=.*ok)(?=.*bob)(?=.*doing)/i, (res) => {
    res.send(`😀 ${res.message.user.name}`);
  });

  robot.router.post(`/hey/indy`, (req, res) => {

    let infos = getInfosWhenEvent(req)
    
    console.log(infos)

    let event = req.headers['x-github-event'];
    // use monet for maybe
    let owner = req.body.repository.owner.login;
    let branch = req.body.ref !== undefined ? req.body.ref.split("/").pop() : undefined; // perhaps an other way to get the branch name?
    let repository_url = req.body.repository.clone_url;
    let repository_name = req.body.repository.name;
    let action = req.body.action;
    let merged = req.body.pull_request !== undefined ? req.body.pull_request.merged : undefined;

    let messages = [
      `:zap: Event: ${event}\n`,
      branch !== undefined ? `- branch: ${branch}\n` : "",
      action !== undefined ? `- action: ${action}\n` : "",
      owner !== undefined ?  `- owner: ${owner}\n` : "",
      `:panda_face: sender: ${req.body.sender.login} | ${req.body.sender.html_url}\n`,
      req.body.organization !== undefined ? `:house: organization: ${req.body.organization.login} | ${req.body.organization.url}\n` : "",
      `:package: repository: ${req.body.repository.name} | ${req.body.repository.html_url}\n`,
      req.body.head_commit !== undefined && req.body.deleted == false ? `:page_facing_up: head_commit: ${req.body.head_commit.message}\n` : "",
      req.body.head_commit !== undefined && req.body.deleted == false ? `${req.body.head_commit.url}\n` : "",
      merged !== undefined ? `pull request merged: ${merged}\n` : "",
      merged !== undefined ? `merged at ${req.body.pull_request.merge_at}\n` : "",
      merged !== undefined ? `merged by ${JSON.stringify(req.body.pull_request.merge_by,null, 2)}\n` : "",
      merged !== undefined ? `PR: ${JSON.stringify(req.body.pull_request,null, 2)}\n` : ""
    ]

    if(event=="issues") {
      // body, id, number, html_url user.login
      messages.push(`issue: "${req.body.issue.title}" by ${req.body.issue.user.login} `);
      messages.push(`issue url: ${req.body.issue.html_url}`);
    }

    if(event=="issue_comment") {
      // body, id, user.login
      messages.push(`issue comment by ${req.body.comment.user.login} `);
      messages.push(`comment url: ${req.body.comment.html_url}`);
    }
    messages.push("\n\n");    

    console.log("❤️", messages)

    robot.messageRoom(process.env.DEV_ROOM, JSON.stringify(infos,null, 2))
    robot.messageRoom(process.env.DEV_ROOM, messages.join(""));
    
    res.status(201).end();
  });

};