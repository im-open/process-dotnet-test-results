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

  core.info(`\nTransforming file ${filePath}`);

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

    // Verify the parsed data contains all the required items so we can fail fast with more descriptive error messages.
    if (!isParsedTrxValid(parsedTrx, filePath)) {
      return;
    }

    // QUESTION:  Why is this an important thing to note?  Is it just leftover from the original implementation?  Can it be removed?
    const runInfos = parsedTrx.TestRun.ResultSummary.RunInfos;
    if (runInfos && runInfos.RunInfo._outcome === 'Failed') {
      core.warning('There is trouble');
    }

    const testDefinitionsAreEmpty = !parsedTrx.TestRun.TestDefinitions || parsedTrx.TestRun.TestDefinitions.length === 0;
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
  } else {
    core.setFailed(`The file '${filePath}' is not valid XML and cannot be parsed.`);
    return;
  }

  return trxDataWrapper;
}

function isParsedTrxValid(parsedTrx, filePath) {
  // Previous versions of the action would have encountered exceptions if the following nodes
  // weren't present when getReportTitle(), areThereAnyFailingTests(), or getMarkupForTrx() were
  // called.  The details would have just been swallowed by a more general exception.  So fail
  // fast with more descriptive error messages by checking for the presence of these items first.
  let missingElement;
  if (!parsedTrx.TestRun) {
    missingElement = 'TestRun';
  } else if (!parsedTrx.TestRun.ResultSummary) {
    missingElement = 'TestRun.ResultSummary';
  } else if (!parsedTrx.TestRun.ResultSummary.Counters) {
    missingElement = 'TestRun.ResultSummary.Counters';
  } else if (!parsedTrx.TestRun.ResultSummary.RunInfos) {
    missingElement = 'TestRun.ResultSummary.RunInfos';
  } else if (!parsedTrx.TestRun.ResultSummary.RunInfos.RunInfo) {
    missingElement = 'TestRun.ResultSummary.RunInfos.RunInfo';
  }
  if (missingElement) {
    core.setFailed(`The file '${filePath}' does not contain the ${missingElement} element.`);
    return false;
  }

  return true;
}

function populateAndFormatObjects(parsedTrx) {
  // Format TestRun.Results
  if (!parsedTrx.TestRun.Results) {
    parsedTrx.TestRun.Results = {
      UnitTestResult: []
    };
  } else if (!parsedTrx.TestRun.Results.UnitTestResult) {
    parsedTrx.TestRun.Results.UnitTestResult = [];
  }
  if (!Array.isArray(parsedTrx.TestRun.Results.UnitTestResult)) {
    parsedTrx.TestRun.Results.UnitTestResult = [parsedTrx.TestRun.Results.UnitTestResult];
  }

  // Format TestRun.TestDefinitions
  if (!parsedTrx.TestRun.TestDefinitions) {
    parsedTrx.TestRun.TestDefinitions = {
      UnitTest: []
    };
  } else if (!parsedTrx.TestRun.TestDefinitions.UnitTest) {
    parsedTrx.TestRun.TestDefinitions.UnitTest = [];
  }

  if (!Array.isArray(parsedTrx.TestRun.TestDefinitions.UnitTest)) {
    parsedTrx.TestRun.TestDefinitions.UnitTest = [parsedTrx.TestRun.TestDefinitions.UnitTest];
  }
}

function getReportTitle(parsedTrx, testDefinitionsAreEmpty) {
  let reportTitle = '';

  if (testDefinitionsAreEmpty) {
    reportTitle = parsedTrx.TestRun.ResultSummary.RunInfos.RunInfo._computerName;
  } else {
    const reportTitleFilter = core.getInput('report-title-filter') || '';

    const unitTests = parsedTrx.TestRun.TestDefinitions.UnitTest;

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
