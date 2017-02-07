// TODO Add calendar integration
// const PublicGcal = require('public-gcal')
// const gcal = new PublicGcal({
//   API_key: process.env.IPFS_CALENDAR_API,
//   calendarId: 'ipfs.io_eal36ugu5e75s207gfjcu0ae84@group.calendar.google.com'
// })

const hackmd = require('generate-hackmd-links')
const Octo = require('octokat')
const gh = new Octo({
  token: process.env.NODE_GITHUB_ISSUE_BOT
})
const path = require('path')
const Promise = require('bluebird')
const readFile = Promise.promisify(require('fs').readFile)
const atob = require('atob')

function getNewLead (repo) {
  return gh.repos(repo).issues.fetch({labels: 'calls'})
  .then((res) => {
    var issue = res.items[0].body
    var lastLead = issue.substring(issue.lastIndexOf('All Hands Call')).match(/@[a-zA-Z0-9]*/g)[0]
    return lastLead.toLowerCase()
  }).then((lead) => {
    // This gets the list from the README of the repo, from the section `Facilitators and Notetakers`
    return gh.repos(repo).readme.fetch()
    .then((res) => {
      var readme = atob(res.content)
      // Dumbly read from the Header to the end of the document, looking for names per line
      // Could be optimized to only look in that section
      var facilitators = readme.substring(readme.lastIndexOf('Facilitators and Notetakers')).match(/\n- @.*/g)
      facilitators = facilitators.map((item) => '@' + item.split('@')[1].toLowerCase())
      if (facilitators.indexOf(lead) !== -1) {
        var nextLeadIndex = facilitators.indexOf(lead) + 1
        return (nextLeadIndex === facilitators.length) ? facilitators[0] : facilitators[nextLeadIndex]
      } else {
        // If you mess up, blame the @ipfs-helper
        return '@ipfs-helper'
      }
    })
  })
}

module.exports = function createIssue (issue) {
  readFile(path.join(__dirname, issue.template), 'utf8').then((data) => {
    return hackmd(data)
  }).then((data) => {
    return getNewLead(issue.repo).then((lead) => {
      data = data.replace(/LEAD/, lead)
      return gh.repos(issue.repo).issues.create({title: issue.title, body: data, labels: issue.labels})
    })
  }).then((res) => res)
}
