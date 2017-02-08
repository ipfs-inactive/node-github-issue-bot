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

// This gets the list from the README of the repo, from the section `Facilitators and Notetakers`
function getNewRoles (repo, lastLead) {
  return gh.repos(repo).readme.fetch()
    .then((res) => {
      var readme = atob(res.content)
      // Dumbly read from the Header to the end of the document, looking for names per line
      // Could be optimized to only look in that section
      var facilitators = readme.substring(readme.lastIndexOf('Facilitators and Notetakers')).match(/\n- @.*/g)
      facilitators = facilitators.map((item) => '@' + item.split('@')[1].toLowerCase())
      var numFacilitators = facilitators.length
      if (facilitators.indexOf(lastLead) !== -1) {
        return {
          lead: facilitators[(facilitators.indexOf(lastLead) + 1) % numFacilitators],
          notetaker: facilitators[(facilitators.indexOf(lastLead) + 2) % numFacilitators]
        }
      } else {
        // If you mess up, blame the @ipfs-helper
        return {
          lead: '@ipfs-helper',
          notetaker: 'TBD'
        }
      }
    })
}

function getLastLead (repo) {
  return gh.repos(repo).issues.fetch({labels: 'calls'})
  .then((res) => {
    var issue = res.items[0].body
    var lastLead = issue.substring(issue.lastIndexOf('All Hands Call')).match(/@[a-zA-Z0-9]*/g)[0]
    return lastLead.toLowerCase()
  }).then((lastLead) => {
    return getNewRoles(repo, lastLead)
  })
}

module.exports = function createIssue (issue) {
  readFile(path.join(__dirname, issue.template), 'utf8').then((data) => {
    return hackmd(data)
  }).then((data) => {
    return getLastLead(issue.repo).then((roles) => {
      data = data.replace(/LEAD/, roles.lead)
      data = data.replace(/NOTER/, roles.notetaker)
      gh.repos(issue.repo).issues.create({title: issue.title, body: data, labels: issue.labels})
    })
  }).then((res) => res)
}
