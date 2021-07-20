const core = require('@actions/core');
const { format, utcToZonedTime } = require('date-fns-tz');
const timezone = core.getInput('timezone') || 'Etc/UTC';

function getMarkupForTrx(testData) {
  return `
  ${getBadge(testData)}
  
  # ${testData.ReportMetaData.ReportTitle}
  ${getTestTimes(testData)}
  ${getTestCounters(testData)}
  ${getTestResultsMarkup(testData)}
  `;
}

function getBadge(testData) {
  const failedCount = testData.TrxData.TestRun.ResultSummary.Counters._failed;
  const passedCount = testData.TrxData.TestRun.ResultSummary.Counters._passed;
  const totalCount = testData.TrxData.TestRun.ResultSummary.Counters._total;
  const testOutcome = testData.TrxData.TestRun.ResultSummary._outcome;

  const badgeCountText = failedCount > 0 ? `${`${failedCount}/${totalCount}`}` : `${`${passedCount}/${totalCount}`}`;

  const badgeStatusText = failedCount > 0 || testOutcome === 'Failed' ? 'FAILED' : 'PASSED';

  const badgeColor = failedCount > 0 || testOutcome === 'Failed' ? 'red' : 'brightgreen';

  return `![Generic badge](https://img.shields.io/badge/${badgeCountText}-${badgeStatusText}-${badgeColor}.svg)`;
}

function formatDate(dateToFormat) {
  if (timezone && timezone.length > 0) {
    let dateWithTimezone = utcToZonedTime(dateToFormat, timezone);
    return `${format(dateWithTimezone, 'yyyy-MM-dd HH:mm:ss.SSS zzz', { timeZone: timezone })}`;
  } else {
    return format(dateToFormat, 'yyyy-MM-dd HH:mm:ss.SSS zzz');
  }
}

function getTestTimes(testData) {
  const startTimeSeconds = new Date(testData.TrxData.TestRun.Times._start).valueOf();
  const endTimeSeconds = new Date(testData.TrxData.TestRun.Times._finish).valueOf();
  const duration = (endTimeSeconds - startTimeSeconds) / 1000;

  return `
  <details>  
    <summary> Duration: ${duration} seconds </summary>
    <table>
      <tr>
          <th>Start:</th>
          <td><code>${formatDate(testData.TrxData.TestRun.Times._start)}</code></td>
      </tr>
      <tr>
          <th>Creation:</th>
          <td><code>${formatDate(testData.TrxData.TestRun.Times._creation)}</code></td>
      </tr>
      <tr>
          <th>Queuing:</th>
          <td><code>${formatDate(testData.TrxData.TestRun.Times._queuing)}</code></td>
      </tr>
      <tr>
          <th>Finish:</th>
          <td><code>${formatDate(testData.TrxData.TestRun.Times._finish)}</code></td>    
      </tr>
      <tr>
          <th>Duration:</th>
          <td><code>${duration} seconds</code></td>
      </tr>
    </table>
  </details>
  `;
}

function getTestCounters(testData) {
  return `
  <details>
    <summary> Outcome: ${testData.TrxData.TestRun.ResultSummary._outcome} | Total Tests: ${testData.TrxData.TestRun.ResultSummary.Counters._total} | Passed: ${testData.TrxData.TestRun.ResultSummary.Counters._passed} | Failed: ${testData.TrxData.TestRun.ResultSummary.Counters._failed} </summary>
    <table>
      <tr>
         <th>Total:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._total}</td>
      </tr>
      <tr>
         <th>Executed:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._executed}</td>
      </tr>
      <tr>
         <th>Passed:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._passed}</td>
      </tr>
      <tr>
         <th>Failed:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._failed}</td>    
      </tr>
      <tr>
         <th>Error:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._error}</td>
      </tr>
      <tr>
         <th>Timeout:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._timeout}</td>
      </tr>
      <tr>
         <th>Aborted:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._aborted}</td>
      </tr>
      <tr>
         <th>Inconclusive:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._inconclusive}</td>
      </tr>
      <tr>
         <th>PassedButRunAborted:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._passedButRunAborted}</td>
      </tr>
      <tr>
         <th>NotRunnable:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._notRunnable}</td>
      </tr>
      <tr>
         <th>NotExecuted:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._notExecuted}</td>
      </tr>
      <tr>
         <th>Disconnected:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._disconnected}</td>
      </tr>
      <tr>
         <th>Warning:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._warning}</td>
      </tr>
      <tr>
         <th>Completed:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._completed}</td>
      </tr>
      <tr>
         <th>InProgress:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._inProgress}</td>
      </tr>
      <tr>
         <th>Pending:</th>
         <td>${testData.TrxData.TestRun.ResultSummary.Counters._pending}</td>
      </tr>
    </table>
  </details>
  `;
}

function getTestResultsMarkup(testData) {
  let resultsMarkup = '';
  if (testData.IsEmpty) {
    return getNoResultsMarkup(testData);
  } else {
    const unittests = testData.TrxData.TestRun.TestDefinitions.UnitTest;
    if (Array.isArray(unittests)) {
      for (const data of unittests) {
        resultsMarkup += getSingleTestMarkup(data, testData);
      }
      return resultsMarkup.trim();
    } else {
      return getSingleTestMarkup(unittests, testData);
    }
  }
}

function getNoResultsMarkup(testData) {
  const runInfo = testData.TrxData.TestRun.ResultSummary.RunInfos.RunInfo;
  const testResultIcon = getTestOutcomeIcon(runInfo._outcome);
  const resultsMarkup = `
  <details>
    <summary>${testResultIcon} ${runInfo._computerName}</summary> 
    <table>
      <tr>
        <th>Run Info</th>
        <td><code>${runInfo.Text}</code></td>
      </tr>
    </table>      
    </details>
  `;
  return resultsMarkup;
}

function getTestOutcomeIcon(testOutcome) {
  if (testOutcome === 'Passed') return ':heavy_check_mark:';
  if (testOutcome === 'Failed' || testOutcome === 'Error') return ':x:';
  if (testOutcome === 'NotExecuted') return ':radio_button:';

  return ':grey_question:';
}

function getSingleTestMarkup(data, testData) {
  core.debug(`Processing ${data._name}`);

  let resultsMarkup = '';
  const testResult = getUnitTestResult(data._id, testData.TrxData.TestRun.Results);
  if (testResult && testResult._outcome === 'Failed') {
    const testResultIcon = getTestOutcomeIcon(testResult._outcome);
    let stacktrace = '';
    let errorMessage = '';
    if (testResult && testResult.Output) {
      stacktrace = `<tr>
        <th>Stack Trace:</th>
        <td><pre>${testResult.Output.ErrorInfo.StackTrace}</pre></td>
      </tr>`;

      errorMessage = `<tr>
        <th>Error Message:</th>
        <td><pre>${testResult.Output.ErrorInfo.Message}</pre></td>
      </tr>`;
    }
    let testMarkup = `
  <details>
    <summary>${testResultIcon} ${data._name}</summary>    
    <table>
      <tr>
         <th>Name:</th>
         <td><code>${data._name}</code></td>
      </tr>
      <tr>
         <th>Outcome:</th>
         <td><code>${testResult._outcome}</code></td>
      </tr>
      <tr>
         <th>Start:</th>
         <td><code>${formatDate(testResult._startTime)}</code></td>
      </tr>
      <tr>
         <th>End:</th>
         <td><code>${formatDate(testResult._endTime)}</code></td>
      </tr>
      <tr>
         <th>Duration:</th>
         <td><code>${testResult._duration}</code></td>
      </tr>
      <tr>
        <th>Code Base</th>
        <td><code>${data.TestMethod._codeBase}</code></td>
      </tr>
      <tr>
        <th>Class Name</th>
        <td><code>${data.TestMethod._className}</code></td>
      </tr>
      <tr>
        <th>Method Name</th>
        <td><code>${data.TestMethod._name}</code></td>
      </tr>
      ${errorMessage}
      ${stacktrace}
    </table>
  `;
    resultsMarkup += testMarkup;
    resultsMarkup += `
  </details>
  `;
  }
  return resultsMarkup.trim();
}

function getUnitTestResult(unitTestId, testResults) {
  const unitTestResults = testResults.UnitTestResult;

  if (Array.isArray(unitTestResults)) {
    return testResults.UnitTestResult.find(x => x._testId === unitTestId);
  }
  return unitTestResults;
}

module.exports = {
  getMarkupForTrx
};
