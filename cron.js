const createIssue = require('./')
const cron = require('node-cron')
const helpers = require('./helpers')

cron.schedule('0 12 * * 3', function () {
  createIssue({
    title: `Monday Calls: ${helpers.getTitleFormat(8, 14)}`,
    template: 'templates/ipfs-all-hands.md',
    repo: 'ipfs/pm',
    labels: ['calls']
  })
})
