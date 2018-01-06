//Global variables
var coins_ticker = ""; //Stores response from Coinmap API
var ticker_tracker = 0; //Tracks where we are in the ticker
var coins_price = {}; //Stores object to link symbol to current price
var current_date = ""; //Stores date for current transaction
var current_symbol = ''; //Stores symbol for the current transaction
var current_price = ''; //Stores price for the current transaction
var current_units = ''; //Stores number of units for current transaction
var start_date = ""; //Stores date of transaction
var total_gain = ''; //stores total gain of transaction


//Code to initialize Firebase. This is Mateo's personal firebase config.
var config = {
	apiKey: "AIzaSyDf35aVp6HQZ9iZTXzPGBO5kI0-T5oMyGc",
    authDomain: "cryptocharters-48619.firebaseapp.com",
    databaseURL: "https://cryptocharters-48619.firebaseio.com",
    projectId: "cryptocharters-48619",
    storageBucket: "cryptocharters-48619.appspot.com",
    messagingSenderId: "949624960748"
};

//Initializes Firebase using the configuration from Mateo
firebase.initializeApp(config);

//Initialized variables for use through
var database = firebase.database();

//Gets the coin data from the API and builds the coins_price object
$.ajax({
	url: 'https://api.coinmarketcap.com/v1/ticker/',
	type: 'GET'
}).done(function(response){

	coins_ticker = response; //saves the ticker.

	displayTicker();

  //Creates object linking coin symbol to price.
	for(var j = 0; j < coins_ticker.length; j++){

		var key = coins_ticker[j].symbol;
		coins_price[key] = coins_ticker[j].price_usd;

	}

});

//Builds and displays the ticker at the top of the navbar. Displays only the first five.
function displayTicker(){

	$('#ticker-view').empty();

	var i = 1;

  //Loops five times each time, displaying five different coins and their information.
	while(i%6 != 0){

		var ticker_div = $('<li>');
		ticker_div.attr('id', ticker_tracker);
		ticker_div.text(" " + coins_ticker[ticker_tracker].symbol + " " + coins_ticker[ticker_tracker].percent_change_24h + " ");

    //Adds an attribute used to hide coins if the screen is smaller
    if(i > 2){

      ticker_div.attr('should-hide', 'true');

    }
    else{

      ticker_div.attr('should-hide', 'false');

    }

		$('#ticker-view').append(ticker_div);

    //Adds red if the coin is going down, green if the coin is going up.
    if(coins_ticker[ticker_tracker].percent_change_24h < 0){

      ticker_div.attr('class' , 'red');

    }else{

      ticker_div.attr('class', 'green');

    }

		ticker_tracker++;
		i++;

	}

  //Resets the counter to 0 once we reach the end of the array
	if(ticker_tracker == coins_ticker.length){

		ticker_tracker = 0;

	}

};

function displayNetGainChart() {
 // console.log(coins_ticker);

  //console.log(database.ref().orderByKey());

  var net_gain_list = [];
  var symbols = [];
  var background_list = [];
  var border_list = [];
  var date_list = [];
  var total_list = [];
  var current_total = 0;


  $('tr').each(function(index){

    var trade_profit = 0;

    if(index != 0){

      symbols.push($(this).find('#symbol').attr('symbol'));
      trade_profit = $(this).find('#net-gain-loss').attr('net-gain-loss');
      trade_profit = parseInt(trade_profit);
      net_gain_list.push(trade_profit);

      date_list.push($(this).find("#date").attr("date"));

      console.log('The trade_profit is: ' + trade_profit);
      console.log('The type of trade_profit is: ' + typeof(trade_profit));

      current_total = current_total + trade_profit;
      console.log('The current total is: ' + current_total);

      total_list.push(current_total);

    }

  });

  console.log('The list of gains is: ' + net_gain_list);
  console.log('The list of symbols is: ' + symbols);
  console.log('The list of dates is: ' + date_list + '\n');
  console.log('The list of totals is: ' + total_list + '\n');

  for (var i = 0; i < net_gain_list.length; i++) {
    if(net_gain_list[i] < 0) {
      background_list.push("rgba(255, 0, 0, 0.5)");
      border_list.push("rgba(255, 0, 0, 1)");
    }
    
    else if (net_gain_list[i] > 0) {
      background_list.push("rgba(81, 255, 0, 0.5)");
      border_list.push("rgba(81, 255, 0, 1)");
    }

    else {
      background_list.push();
      border_list.push();
    }
  };

  var chart = document.getElementById('net-gain').getContext("2d");
  var net_gain_chart = new Chart(chart, {
    type: "bar",
    data: {
      labels: symbols,
      datasets: [{
        label: "Total Net Profit/Loss $ per Coin",
        data: net_gain_list,
        backgroundColor: background_list,
        borderColor: border_list,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true

          }
        }]
      },
      legend: {
        display: false
      }
    }
  });

  var profit_chart = document.getElementById('total-profit').getContext("2d");
  var total_profit_chart = new Chart(profit_chart, {
    type: "line",
    data: {
      labels: date_list,
      datasets: [{
        label: "Total Trade Profit",
        data: total_list,
        backgroundColor: background_list,
        borderColor: border_list,
        borderWidth: 1
      }]
    },
    options: {
      legend: {
        display: true
      }
    }
  });


};

//Event listener that runs function upon clicking submit.
$('#add-trade-button').on('click', function(){

  //Prevents the page from reloading.
  event.preventDefault();

  //Gets the inputted values for the employees from the form and increments
  //employee count.
  current_date = $('#date-input').val();
  current_symbol = $('#symbol-input').val();
  current_price = $('#price-input').val();
  current_units = $('#units-input').val();



  //Pushes the individual entry to the database. Push adds it as one 
  //item with a single unique id.
  database.ref().push({

    date: current_date,
    symbol: current_symbol,
    price: current_price,
    units: current_units,

  });

  displayNetGainChart();

});

//Displays the new employee upon being added. Takes only a snapshot of the 
//added child.
database.ref().on('child_added', function(child_snapshot){

  //Gets the snapshot values.
  current_date = child_snapshot.val().date;
  current_symbol = child_snapshot.val().symbol;
  current_price = child_snapshot.val().price;
  current_units = child_snapshot.val().units;

  //Creates the table row
  var table_row = $('<tr>');

  //Creates the date column.
  var date_col = $('<td>').text(current_date);
  date_col.attr('date', current_date);
  date_col.attr('id', 'date');
  table_row.append(date_col);

  //Creates the symbol column.
  var symbol_col = $('<td>').text(current_symbol);
  symbol_col.attr('symbol', current_symbol);
  symbol_col.attr('id', 'symbol');
  table_row.append(symbol_col);

  //Creates the trade price column.
  var price_col = $('<td>').text(current_price);
  price_col.attr('price', current_price);
  price_col.attr('id', 'bought-price');
  table_row.append(price_col);


  //Creates the units column.
  var units_col = $('<td>').text(current_units);
  units_col.attr('units', current_units);
  units_col.attr('id', 'units');
  table_row.append(units_col);

  //Creates the current price column
  var real_price = coins_price[current_symbol];
  var current_price_col = $('<td>').text(real_price);
  current_price_col.attr('current-price', real_price);
  current_price_col.attr('id', 'current-price');
  table_row.append(current_price_col);

  //Creates the net gain/loss column.
  var net_gain_loss = (coins_price[current_symbol] - current_price) * current_units;
  var gain_loss_col = $('<td>').text(net_gain_loss);
  gain_loss_col.attr('net-gain-loss', net_gain_loss);
  gain_loss_col.attr('id', 'net-gain-loss');
  table_row.append(gain_loss_col);

  //Appends entire row to the table.
  $('#trade-table').append(table_row);

  displayNetGainChart();

}, function(errorObject){

    console.log("The read failed: " + errorObject.code);

});

$(document).ready(function(){

  displayNetGainChart();

});

//Updates the navbar ticker every five seconds.
window.setInterval(function(){

	displayTicker();

}, 5000);

window.setInterval(function(){

  displayNetGainChart();

}, 60000);


//Updates the two coin data structures used every thirty minutes.
window.setInterval(function(){

	$.ajax({
		url: 'https://api.coinmarketcap.com/v1/ticker/',
		type: 'GET'
	}).done(function(response){

		coins_ticker = response;

    for(var j = 0; j < coins_ticker.length; j++){

      var key = coins_ticker[j].symbol;
      coins_price[key] = coins_ticker[j].price_usd;

    }
	});

}, 1800000);
