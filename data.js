const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();
const apiURI = 'https://api.gdax.com';
const sandboxURI = 'https://api-public.sandbox.gdax.com';
const websocket = new Gdax.WebsocketClient(['BTC-USD', 'ETH-USD']);

const Influx = require('influx');

var fs = require('fs');



const influx = new Influx.InfluxDB({
	host: 'localhost',
	database: 'gdax-data',
	schema: [{
		measurement: 'btc-data',
		fields: {
			trade_id: Influx.FieldType.INTEGER,
			price: Influx.FieldType.INTEGER,
			size: Influx.FieldType.INTEGER,
			bid: Influx.FieldType.INTEGER,
			ask: Influx.FieldType.INTEGER,
			volume: Influx.FieldType.INTEGER,
			time: Influx.FieldType.DATE
		},
		tags: [
			'coin'
		]
	}]
})


//==================================================================
// Function to stream data from GDAX. dedup filter applied
//===============================================================

let  getTicker = () => {
	var dataArray = [];
	var current_timestamp = "";
	var timestamp_seconds ;
	var timestamp_iso; 
	var duplicate_array = [];
	var time_multiplier = 0;

	console.log("FUNCTION START!")

	console.log(current_timestamp)

	setInterval(function(){
		publicClient.getProductTicker('BTC-USD',(err, response, data) =>{
			try{
				dataArray = [data.trade_id,data.price, data.size, data.bid, data.ask, data.volume, data.time];
				timestamp_seconds = new Date(data.time).getTime();
				console.log("Timestamp in seconds: " +  timestamp_seconds);
		
				if(current_timestamp === "" ){

					current_timestamp = timestamp_seconds; 

					console.log("=============================")
					console.log("TImestamp Initilized");
					console.log(current_timestamp);
					console.log("=============================")  
					dataArray[6] = new Date(data.time);
					duplicate_array.push(current_timestamp);
					
				}else if(current_timestamp === timestamp_seconds){

					time_multiplier = (duplicate_array.length) * 1000
					timestamp_iso = new Date(timestamp_seconds + time_multiplier)
					dataArray[6] = timestamp_iso; 
					duplicate_array.push(timestamp_seconds);

					console.log("=========================")
					console.log("duplicate found")
					console.log("length of dup array: " + duplicate_array.length)
					console.log(duplicate_array)
					console.log("=========================")
					
				}else{
					current_timestamp = timestamp_seconds;
					dataArray[6] = new Date(data.time);
					duplicate_array = [];
					duplicate_array.push(timestamp_seconds);
				}			

				fs.open('data.txt', 'a', 666, function( e, id ) {
				   fs.write( id, dataArray + "\n", null, 'utf8', function(){
						console.log(dataArray);
						console.log('file is updated');
				    });
				
				  });
			}
			catch(err){
				console.log("error with getTicker function" + err);
					let timestamp = new Date();
					let log = [timestamp, "index error: " + dataArray.indexOf(null), err]
					fs.open('log.txt', 'a', 666, function( e, id ) {
					   	fs.write( id, log + "\n", null, 'utf8', function(){
							console.log(log);
							console.log('file is updated');
					    });
				 	 });
					console.log("NULL found in data:")		
			}

		});
	},1000);
}


//==================================================================
// Function to read from TXT file and input to local influx DB
//==================================================================

let dbDump = () => {
	var fs  = require("fs");
	fs.readFile('data.txt', function(err, f){
	    var array = f.toString().split('\n');
	    console.log(array)

		influx.writePoints([
			{
				measurement: 'btc-data',
				tags: { coin: "btc",
				fields: {
					trade_id: array[0],
					price: array[1],
					size: array[2],
					bid: array[3],
					ask: array[4],
					volume: array[5],
					time: array[6]
				},
			}
		]).then(() => {
			return influx.query(`
			    select * from btc-data
			    where host = "btc"
			    order by time desc
			    limit 10
			 `)
		}).then(rows => {
		  rows.forEach(row => console.log(`A request to ${row.path} took ${row.duration}ms`))
		})
	});
}


//==================================================================
//  Run progrm
//==================================================================

if(process.argv[2] === "stream"){
	getTicker();

}else if(process.argv[2] === "db_dump"){
	console.log("test complete")
	dbDump();
}

process.on('getTicker', function (err) {
	fs.writeSync(1, `Caught exception: ${err}\n`);
	console.log('Caught exception: ', err);
});
