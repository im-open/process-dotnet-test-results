const core = require('@actions/core');
const fs = require('fs');
const glob = require('glob');
const xmlParser = require('fast-xml-parser');
const he = require('he');

function findTrxFiles(baseDir) {
  core.info(`Looking for trx files in '${baseDir}'...`);

  const files = glob.sync(baseDir + '/**/*.trx', {});
  if (!files || files.length === 0) {
    throw new RangeError('There were no trx files found.');
  }

  core.info(`The following trx files were found:`);
  core.info(`\t${files.join('\n\t')}`);
  return files;
}

async function transformAllTrxToJson(trxFiles) {
  const transformedTrxReports = [];

  for (const trx of trxFiles) {
    transformedTrxReports.push(await transformTrxToJson(trx));
  }

  return transformedTrxReports;
}

async function transformTrxToJson(filePath) {
  let trxDataWrapper;

  core.info(`Transforming file ${filePath}`);

  const xmlData = fs.readFileSync(filePath, 'utf-8');
  const options = {
    attributeNamePrefix: '_',
    textNodeName: '#text',
    ignoreAttributes: false,
    ignoreNameSpace: false,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    cdataTagName: '__cdata',
    cdataPositionChar: '\\c',
    parseTrueNumberOnly: false,
    arrayMode: false,
    attrValueProcessor: (val, _attrName) =>
      he.decode(val, {
        isAttributeValue: true
      }),
    tagValueProcessor: (val, _tagName) => he.decode(val),
    stopNodes: ['parse-me-as-string']
  };

  if (xmlParser.validate(xmlData.toString()) === true) {
    const jsonString = xmlParser.parse(xmlData, options, true);
    const testData = jsonString;
    const runInfos = testData.TestRun.ResultSummary.RunInfos;
    if (runInfos && runInfos.RunInfo._outcome === 'Failed') {
      core.warning('There is trouble');
    }

    const reportHeaders = getReportHeaders(testData);
    trxDataWrapper = {
      TrxData: jsonString,
      IsEmpty: testData.TestRun.TestDefinitions ? false : true,
      ReportMetaData: {
        TrxFilePath: filePath,
        ReportName: `${reportHeaders.reportName}-check`,
        ReportTitle: reportHeaders.reportTitle,
        TrxJSonString: JSON.stringify(jsonString),
        TrxXmlString: xmlData
      }
    };
  }
  return trxDataWrapper;
}

function getReportHeaders(data) {
  let reportTitle = '';
  let reportName = '';
  const isEmpty = data && data.TestRun && data.TestRun.TestDefinitions ? false : true;

  if (isEmpty) {
    reportTitle = data.TestRun.ResultSummary.RunInfos.RunInfo._computerName;
    reportName = data.TestRun.ResultSummary.RunInfos.RunInfo._computerName.toUpperCase();
  } else {
    const unittests =
      data.TestRun && data.TestRun.TestDefinitions && data.TestRun.TestDefinitions.UnitTest
        ? data.TestRun.TestDefinitions.UnitTest
        : '';

    const storage = getAssemblyName(unittests);

    const dllName = storage.replace(/\\/g, '/').replace('.dll', '').toUpperCase().split('/').pop();

    if (dllName) {
      //'c:\\code\\actions\\1up\\src\\levelup.tests\\bin\\release\\netcoreapp3.1\\levelup.tests.dll'

      reportTitle = dllName;
      reportName = dllName;
    }
  }

  return {
    reportName,
    reportTitle
  };
}

function getAssemblyName(unittests) {
  if (Array.isArray(unittests)) {
    core.debug('Its an array');
    return unittests[0]._storage;
  } else {
    const ut = unittests;
    if (ut) {
      core.debug(`Its not an array: ${ut._storage}`);
      return ut._storage;
    } else {
      return 'NOT FOUND';
    }
  }
}

function areThereAnyFailingTests(trxJsonReports) {
  core.info(`Checking for failing tests..`);
  for (const trxData of trxJsonReports) {
    if (trxData.TrxData.TestRun.ResultSummary._outcome === 'Failed') {
      core.warning(`At least one failing test was found.`);
      return true;
    }
  }
  core.info(`There are no failing tests.`);
  return false;
}

module.exports = {
  findTrxFiles,
  transformAllTrxToJson,
  areThereAnyFailingTests
};
