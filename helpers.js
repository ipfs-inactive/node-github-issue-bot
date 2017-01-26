const moment = require('moment')

function getTitleFormat (start, end) {
  var startMonth = moment(moment().day(start)).format("MMM")
  var endMonth = moment(moment().day(end)).format("MMM")
  if (startMonth === endMonth) {
    return `${moment(moment().day(start)).format("MMM DD")}-${moment(moment().day(end)).format("DD")}`
  } else {
    return `${moment(moment().day(start)).format("MMM DD")}-${moment(moment().day(end)).format("MMM DD")}`
  }
}

module.exports = {
  getTitleFormat: getTitleFormat
}
