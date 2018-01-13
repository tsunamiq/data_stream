const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();


const apiURI = 'https://api.gdax.com';
const sandboxURI = 'https://api-public.sandbox.gdax.com';


const websocket = new Gdax.WebsocketClient(['BTC-USD', 'ETH-USD']);


var fs = require('fs');


setInterval(function(){ getTicker() }, 1000);






let  getTicker = () => {
	var dataArray = [];
	publicClient.getProductTicker('BTC-USD',(err, response, data) =>{
		if(err){
			console.log("error with getTicker function");
		}else{
			dataArray = [data.trade_id,data.price, data.size, data.bid, data.ask, data.volume, data.time];
			console.log(dataArray);

			// fs.appendFile("data.txt",dataArray , function(err) {
			//     if(err) {
			//         return console.log(err);
			//  }

			 fs.open('data.txt', 'a', 666, function( e, id ) {
			   fs.write( id, dataArray + "\n", null, 'utf8', function(){
			 
			     console.log('file is updated');
			    });
			
			  });
		}
	});
}

