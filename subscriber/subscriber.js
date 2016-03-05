/**
 * Created by max on 3/4/16.
 */
var rabbit = require('wascally');
var config = require('./../config/config');

console.log(config);

rabbit.configure(config).then(processMessage).then(undefined, reportErrors);

function processMessage() {

    // set all the handlers before starting subscription
    rabbit.handle('orders.incoming.type', handleMessage);


    // start subscription
     rabbit.startSubscription(config.queues[0].name);
}

function handleMessage(message) {

    // here we can do something to the received message.
    var body = message.body;

    console.log(body);

    message.ack();
}

function reportErrors(err) {
    console.log(err.stack);
}




