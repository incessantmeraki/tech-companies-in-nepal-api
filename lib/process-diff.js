const Table = require('./table');
const utils = require('./utils');
const winston = require('winston');
const lang = require('lodash/lang');
const extractors = require('./extractors');
const collection = require('lodash/collection');

const { isNil } = lang;
const { every } = collection;
const { splitAndTrim } = utils;
const { extractUrl, extractDiff, extractKeywords, extractLocations, extractCompanyName} = extractors;

/**
 * Add to companies table.
 *
 * @param {Array} addition
 * @returns {Promise}
 */
const addToTable = (addition) => {
  let [companyAndUrl, location, description] = splitAndTrim(addition, '|');
  let name = extractCompanyName(companyAndUrl);
  let url = extractUrl(companyAndUrl);
  let shouldProcess = every([name, url, location, description], Boolean);

  if (!shouldProcess) {
    return;
  }

  return extractLocations(location).then((locationRecords) => {
    let locations = locationRecords.map((r) => r.getId());
    let companiesTable = new Table('Companies');

    return companiesTable
      .findOrCreateBy(`{Name} = "${name}"`, { 'Name': name })
      .then((record) => {
        let id = record.getId();

        return extractKeywords(description)
          .then((keywords) => companiesTable.update(id, {
            'Website': url,
            'Description': description,
            'Location': [...locations],
            'Keywords': [...keywords]
          }, { typecast: true }));
      })
      .then((record) => winston.info(`OK: ${record.getId()} | ${record.get('Name')}`))
      .catch((err) => winston.error(err));
  });
}

/**
 * Extract diff from raw diff.
 *
 * @param {String} [rawDiff='']
 * @returns {Array<String>}
 */
const processDiff = (rawDiff = '') => {
  let extracted = extractDiff(rawDiff);

  if (isNil(extracted)) {
    winston.warn('Could not extract from diff');
    return;
  }

  return extracted.map(addToTable);
};

module.exports = processDiff;