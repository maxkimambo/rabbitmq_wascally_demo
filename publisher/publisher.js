/**
 * Created by max on 3/4/16.
 */
var mq = require('wascally');
var config = require('./../config/config');

function publisher (){

}

publisher.prototype.publish = function(msg){
    mq.configure(config)
        .then(this.sendMessage(msg))
        .then(undefined, this.reportErrors);
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

    console.log('sent message %s', msg);
};


module.exports = publisher;




