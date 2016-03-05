/**
 * Created by max on 3/4/16.
 */
var mq = require('wascally');
var config = require('./../config/config');

function publisher (){

    var connection;

        var publisher = function(){
            connection = this.connect();
        };

    publisher.prototype.publish = function(msg){
        mq.configure(config)
            .then(this.sendMessage(msg))
            .then(undefined, reportErrors);
    };

    publisher.prototype.reportErrors = function(err){
        console.log(err.stack);
         process.exit();
    };

    publisher.prototype.connect = function(){

        return mq.configure(config);
    };

    publisher.prototype.sendMessage = function sendMessages(msg) {

        mq.publish(config.exchanges[0].name, {
            type: "orders.incoming.type",
            routingKey: "",
            body: msg
        });

        console.log('sent message %', msg);
    };

}

module.exports = new publisher();




