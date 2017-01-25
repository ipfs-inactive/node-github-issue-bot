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

module.exports = function createIssue (issue) {
  readFile(path.join(__dirname, issue.template), 'utf8').then((data) => {
    return hackmd(data)
  }).then((data) => {
    return gh.repos(issue.repo).issues.create({title: issue.title, body: data, labels: issue.labels})
  }).then((res) => res)
}
