const core = require('@actions/core');
const fs = require('fs');
const glob = require('glob');
const { XMLParser, XMLValidator } = require('fast-xml-parser');
const he = require('he');
const path = require('path');

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
  const xmlParser = new XMLParser({
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
  });

  if (XMLValidator.validate(xmlData.toString()) === true) {
    const parsedTrx = xmlParser.parse(xmlData);
    const runInfos = parsedTrx.TestRun.ResultSummary.RunInfos;
    if (runInfos && runInfos.RunInfo._outcome === 'Failed') {
      core.warning('There is trouble');
    }

    const testDefinitionsAreEmpty = parsedTrx && parsedTrx.TestRun && parsedTrx.TestRun.TestDefinitions ? false : true;
    populateAndFormatObjects(parsedTrx);
    const reportTitle = getReportTitle(parsedTrx, testDefinitionsAreEmpty);

    trxDataWrapper = {
      TrxData: parsedTrx,
      IsEmpty: testDefinitionsAreEmpty,
      ReportMetaData: {
        TrxFilePath: filePath,
        ReportName: `dotnet unit tests (${reportTitle})`,
        ReportTitle: reportTitle,
        TrxJSonString: JSON.stringify(parsedTrx),
        TrxXmlString: xmlData
      }
    };
  }
  return trxDataWrapper;
}

function populateAndFormatObjects(parsedTrx) {
  if (!parsedTrx.TestRun) {
    parsedTrx.TestRun = {
      Results: {
        UnitTestResult: []
      },
      TestDefinitions: {
        UnitTest: []
      }
    };
  } else {
    if (!parsedTrx.TestRun.Results) {
      parsedTrx.TestRun.Results = {
        UnitTestResult: []
      };
    } else if (!parsedTrx.TestRun.Results.UnitTestResult) {
      parsedTrx.TestRun.Results.UnitTestResult = [];
    }

    if (!parsedTrx.TestRun.TestDefinitions) {
      parsedTrx.TestRun.TestDefinitions = {
        UnitTest: []
      };
    } else if (!parsedTrx.TestRun.TestDefinitions.UnitTest) {
      parsedTrx.TestRun.TestDefinitions.UnitTest = [];
    }
  }

  if (!Array.isArray(parsedTrx.TestRun.Results.UnitTestResult)) {
    parsedTrx.TestRun.Results.UnitTestResult = [parsedTrx.TestRun.Results.UnitTestResult];
  }
  if (!Array.isArray(parsedTrx.TestRun.TestDefinitions.UnitTest)) {
    parsedTrx.TestRun.TestDefinitions.UnitTest = [parsedTrx.TestRun.TestDefinitions.UnitTest];
  }
}

function getReportTitle(data, isEmpty) {
  let reportTitle = '';
  const reportTitleFilter = core.getInput('report-title-filter') || '';

  if (isEmpty) {
    reportTitle = data.TestRun.ResultSummary.RunInfos.RunInfo._computerName;
  } else {
    const unitTests = data.TestRun.TestDefinitions.UnitTest;

    if (reportTitleFilter != '') {
      const unitTestNames = unitTests.length > 0 ? unitTests[0]._name.split('.') : [];
      reportTitle = unitTestNames.length > 0 ? unitTestNames[unitTestNames.indexOf(reportTitleFilter) + 1] : null;
    }

    if (!reportTitle) {
      const storage = unitTests.length > 0 && unitTests[0]._storage ? unitTests[0]._storage : 'NOT FOUND';
      const dllName = storage.replace(/\\/g, '/').replace('.dll', '').toUpperCase().split('/').pop();
      if (dllName) {
        reportTitle = dllName;
      }
    }
  }

  return reportTitle;
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

function createResultsFile(resultsFileName, results) {
  core.info(`Writing results to ${resultsFileName}`);
  let resultsFilePath = null;

  fs.writeFile(resultsFileName, results, err => {
    if (err) {
      core.info(`Error writing results to file. Error: ${err}`);
    } else {
      core.info('Successfully created results file.');
      core.info(`File: ${resultsFileName}`);
    }
  });
  resultsFilePath = path.resolve(resultsFileName);
  core.exportVariable('TEST_RESULTS_FILE_PATH', resultsFilePath);

  return resultsFilePath;
}

function deleteResultsFile(resultsFilePath) {
  core.info(`Removing markdown file: ${resultsFilePath}`);
  if (fs.existsSync(resultsFilePath)) {
    fs.unlink(resultsFilePath, err => {
      if (err) {
        core.error(`Error in deleting file ${resultsFilePath}.  Error: ${err}`);
      }
      core.info(`Successfully deleted results file: ${resultsFilePath}`);
    });
  }
}

module.exports = {
  findTrxFiles,
  transformAllTrxToJson,
  areThereAnyFailingTests,
  createResultsFile,
  deleteResultsFile
};
