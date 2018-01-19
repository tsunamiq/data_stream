const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();
const apiURI = 'https://api.gdax.com';
const sandboxURI = 'https://api-public.sandbox.gdax.com';
const websocket = new Gdax.WebsocketClient(['BTC-USD', 'ETH-USD']);

var fs = require('fs');

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

getTicker();

