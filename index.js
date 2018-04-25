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

// This gets the list from the README of the repo, from the section `Moderators and Notetakers`
function getNewRoles (repo, lastLead) {
  // if something messes up, blame the @ipfs-helper
  var defaultNewRoles = { 
    lead: '@ipfs-helper',
    notetaker: 'TBD'
  }

  return gh.repos(repo).readme.fetch()
    .then((res) => {
      var readme = atob(res.content)
      // Dumbly read from the Header to the end of the document, looking for names per line
      // Could be optimized to only look in that section
      var facilitators = readme.substring(readme.lastIndexOf('Moderators and Notetakers')).match(/\n- @.*/g)
      
      // If Moderator list in the Readme isn't up to snuff, return default 
      if (!facilitators) return defaultNewRoles

      facilitators = facilitators.map((item) => '@' + item.split('@')[1].toLowerCase().trim())
      var numFacilitators = facilitators.length
      if (facilitators.indexOf(lastLead) !== -1) {
        return {
          lead: facilitators[(facilitators.indexOf(lastLead) + 1) % numFacilitators],
          notetaker: facilitators[(facilitators.indexOf(lastLead) + 2) % numFacilitators]
        }
      } else {
        return defaultNewRoles
      }
    })
}

// Gets the Lead from the last call.
// Uses the call Issue from the repo, looks for first @name in the All Hands Call section
// Assumes that gh returns the issues in inverse chronological order
function getLastLead (repo) {
  return gh.repos(repo).issues.fetch({labels: 'calls', state: 'all'})
  .then((res) => {
    var issue = res.items[0].body
    var lastLeadMatch = issue.substring(issue.lastIndexOf('All Hands Call')).match(/@[a-zA-Z0-9]*/g)
    var lastLead = (lastLeadMatch) ? lastLeadMatch[0] : 'Unknown'
    return lastLead.toLowerCase()
  }).then((lastLead) => {
    return getNewRoles(repo, lastLead)
  })
}

/**
 * Create a github issue, substituting lookup phrases in the issue.body.  Uses environment variable NODE_GITHUB_ISSUE_BOT for github credentials.
 * 
 * @param {Object} issue - The issue being created.
 * @param {string} issue.repo - The github repo (e.g., "ipfs/pm")
 * @param {string} issue.title
 * @param {string} issue.template - Specified as file in the repo (e.g., "templates/ipfs-all-hands.md").  
 * "(HACKMD)" will be substituted with a link to a new hackmd.io page
 * "LEAD" and "NOTER" will be substitued with the username of the next lead and noteaker, respectively (based on the Moderators and Notetakers section of the repo's README)  
 * @param {array} issue.labels
 * 
 */
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
