/**
 * Created by max on 3/4/16.
 */
var mq = require('wascally');
var config = require('./../config/config');

function sendMessages() {

    setInterval(
        function(){

            mq.publish(config.exchanges[0].name, {
                type: "orders.incoming.type",
                routingKey: "",
                body: new Date()
            });
            console.log('sent message %s', message);
        }
        ,1000);

}

function reportErrors(err) {
    console.log(err.stack);
    process.exit();
}

mq.configure(config)
    .then(sendMessages)
    .then(undefined, reportErrors);

