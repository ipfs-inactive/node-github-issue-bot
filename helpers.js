const moment = require('moment')

/** 
 * Returns the date for the upcoming dayOfTheWeek in format MMM DD YYYY (e.g., "Apr 09 2018")
 * 
 * @param {string} dayOfTheWeek - The day of the week that the issue title should reference (e.g., "Monday")
 */
function getTitleFormat (dayOfTheWeek) { 

  // moment().day() sets the day of the week for the current (Sunday - Saturday) week.
  var mtgDay = moment().day(dayOfTheWeek)
  
  // if the mtgDay is in the past, add a week
  mtgDay = (mtgDay.isBefore(moment({hour: 0}))) ? mtgDay.add(7, 'days') : mtgDay 

  return mtgDay.format("MMM DD YYYY")
}


module.exports = {
  getTitleFormat: getTitleFormat
}
