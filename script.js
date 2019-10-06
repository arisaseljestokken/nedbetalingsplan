/* Fetch userinputs from form */
function getInputValues() {
  let userInputs = document.getElementById("inputValues").elements;
  let values = {
    laanebelop: userInputs[0].value,
    nominellRente: userInputs[3].value,
    terminGebyr: userInputs[4].value,
    utlopsDato: userInputs[2].value,
    saldoDato: "2020-01-01",
    datoForsteInnbetaling: userInputs[1].value,
    ukjentVerdi: "TERMINBELOP"
  };
  return values;
}

/* If valid values then connect to payload */
function makeRepaymentplan() {
  let payload = getInputValues();
  if (payload) {
    let response = connect(payload);
  } else {
    console.log("Something went wrong while fetching input values");
  }
}

/* Connect to payload, update table and return response */
function connect(payload) {
  $.ajax({
    async: true,
    crossDomain: true,
    url:
      "https://visningsrom.stacc.com/dd_server_laaneberegning/rest/laaneberegning/v1/nedbetalingsplan",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    processData: false,
    data: JSON.stringify(payload)
  }).done(function(response) {
    updateTable(response);
    return response;
  });
  //.fail(console.log("..."))
}

/* Update table and return values to summary */
function updateTable(response) {
  transformPlaceholder();
  let innbetalingTab = response.nedbetalingsplan.innbetalinger;
  rad = { dato: "Dato", sum: "Å betale", tax: "Renter", rest: "Gjenstår" };
  let table = document.getElementById("tab");
  let row = table.insertRow(0);
  let column0 = row.insertCell(0);
  let column1 = row.insertCell(1);
  let column2 = row.insertCell(2);
  let column3 = row.insertCell(3);
  (column0.innerHTML = rad.dato),
    (column1.innerHTML = rad.sum),
    (column2.innerHTML = rad.tax),
    (column3.innerHTML = rad.rest);

  $("#mainButton").click(function() {
    $("#tab").empty();
  });

  let sumRenter = 0;
  let prosentRenter = 0;
  for (let i = 0; i < innbetalingTab.length; i++) {
    sumRenter += innbetalingTab[i].renter;
    let columns =
      "<tr>" +
      "<th class='dateColumn'> " +
      innbetalingTab[i].dato +
      "</th>" +
      "<th class='sumColumn'> " +
      innbetalingTab[i].total.toFixed(0) +
      "</th>" +
      "<th class='taxColumn'> " +
      innbetalingTab[i].renter.toFixed(0) +
      "</th>" +
      "<th class='loanColumn'> " +
      innbetalingTab[i].restgjeld.toFixed(0) +
      "</th>" +
      "</tr>";
    $("#tab").append(columns);
  }
  prosentRenter = (sumRenter / parseInt(getInputValues().laanebelop)) * 100;
  let values = {
    sumRenter: sumRenter.toFixed(0),
    prosentRenter: prosentRenter.toFixed(0)
  };
  summary(values);
}

/* Transform placeholder text in the right section */
function transformPlaceholder() {
  var nedbetalingsplanTittel = document.getElementById(
    "placeholderNedbetalingsplan"
  );
  nedbetalingsplanTittel.innerHTML = "Nedbetalingsplan";
  nedbetalingsplanTittel.style.cssText = "font-size:17px;";
}

/* Write a summary report about the repaymentplan */
function summary(values) {
  let aar =
    parseInt(getInputValues().utlopsDato.substr(0, 4)) -
    parseInt(getInputValues().datoForsteInnbetaling.substr(0, 4));
  var summaryTitle = document.getElementById("summaryTitle");
  var summaryText = document.getElementById("summaryText");
  summaryTitle.innerHTML = "Oppsummering";
  summaryTitle.style.cssText = "font-size:17px;font-weight:bold;";
  summaryText.innerHTML =
    "Totalt bruker du " +
    aar +
    " år på nedbetaling av lånet.<br>" +
    "Totalt betaler du " +
    values.sumRenter +
    " kroner i renter.<br>" +
    "Totalt tilsvarer rentene " +
    values.prosentRenter +
    " % av hele lånebeløpet.";
}
