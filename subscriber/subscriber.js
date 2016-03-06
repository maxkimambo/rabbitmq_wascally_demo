/**
 * Created by max on 3/4/16.
 */
var rabbit = require('wascally');
var config = require('./../config/config');


rabbit.configure(config).then(processMessage).then(undefined, reportErrors);


/**
Sets up a a message handler and a listener.
 */
function processMessage() {

    // set all the handlers before starting subscription
    rabbit.handle('orders.incoming.type', handleMessage);

    // start subscription
     rabbit.startSubscription(config.queues[0].name);
}

/**
 * Handles incoming messages
 * @param message
 */
function handleMessage(message) {

    // here we can do something to the received message.
    // e.g perform database insert
    // send out email
    // bill a person etc etc
    var body = message.body;

    console.log(body);

    // after having processed the message we need to acknowledge it.
    message.ack();
}

/**
 * Rudimentary error handling.
 * @param err
 */
function reportErrors(err) {
    console.trace(err);
}




