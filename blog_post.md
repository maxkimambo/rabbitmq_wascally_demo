
##Effective ways to use Node with RabbitMQ 

##Summary   
To architect microservices architecture which is hot right now, most tend to take a look at some form of messaging bus  
This case is no other, in this series we shall take a look at how to get NodeJs to play nicely with RabbitMQ. 

RabbitMQ is a renowened messaging solution that has been around for quite a while and offers quite a few features out of the box and is pretty easy to get started.  

We are going to setup a simple signup registration form that will be processed by  microservices, what is important here is how the whole system is tied up with RabbitMQ rather then the sample application that we will write to demonstrate the concept.  

If you are familiar with the basics of how RabbitMQ works then feel free to skip to the project section.    
 
## Assumptions 
This article assumes you have a basic understanding of messaging systems as well as NodeJS and that you have both 
NodeJS and RabbitMQ  installed.  

if not then the simplest way to do is to do it via docker. 

``` 
docker run -d --hostname=mq --name mq -p 8080:15672 -p 5672:5672 rabbitmq:3-management
```
For node use one of the tutorials online . 

## Some basic concepts 

### Channels 
For starters lets demistify them channels. 

These are like a virtual connection over the real TCP connection, the reason they exist is that RabbitMQ connections are expensive to create.  
Every channel has an ID assigned to it.  

All communication happens inside this channel. If we use the analogy of a coaxial cable, the cable itself is the connection and each copper strand inside that cable is a channel.  

Your app can create _n_ number of channels over a single TCP connection, this is much more efficient than creating many TCP connections.  

### Queues  

Queue is the place where the messages end up redy to be picked up by the consumer, 
this is like the mailbox in the destination post office. 

Consumers receive messages in one of two ways: 
  
1.  basic.consume - command, this places the channel into subscribe mode until unsubscribed from the queue, during this time the consumer automatically  receives all the messages sent. 

2.  basic.get this will receive only one message in the queue but will not automatically receive further messages, its not a good idea to put basic.get into a loop, just use basic.consume for high throughput subscriptions.   

In the case where more than one subscriber for a message exists, messages are delivered in a round robin fashion.  
The subscribers need to acknowledge the receipt of the message if not ack is sent then the message is resent to the next subscriber.  
Its usually a good practice not to acknowledge the message until after it has been processed, should the error occur you can still send back the basic.reject command and the message will be requeued to the next available consumer, if requeue was set to true of course.  

To discard a message, if it is a malformed one send reject command with requeue set to false. 

Queues can be created via queue.declare command, if no name is specified RabbitMQ will generate one for you and return in response to the command.  

**Note**: messages that are published but have no queue to be routed to are automatically discarded. 

Binding: Is how the message gets routed to a particular queue, think of this like the address of the destination post office  on a parcel.  

When a messages gets delivered to an exchange, it gets routed to the queue using some routing rules based on a routing key, that is why its said that a queue is bound to an exchange.  

If there is no match then the message is blackholed. 

Exchange: Is where the producer of the message delivers the message, think of it like a Post Office   

There are different exchange types in RabbitMQ  

1. Direct   
  If the routing key matches, then the message is delivered to the corresponding queue, so basically 1:1 transmission. 
  
2. Fanout  
   This type of exchange publishes the message to multiple queues (1:n)  
   E.g if you have a twitter like app, the user posts a comment, one queue will be for processing that comment, the other is to increment the comment count in the user profile.  
     
3. Topic  

   Here the messages can arrive to a queue from different sources (n:1)    

4. Headers (almost never used due to its poor performance)  

###VHOSTS 

Vhosts lets us create a logical separation between rabbitMQ instances, you can call them mini-RabbitMQs if you like, its usually a good idea to create different Vhosts for common functionality groups of your application. e.g. separate VHost for logging.  

One thing to keep in mind though, you can not communicate between exchanges on different VHosts, they are really like separate instances. 
Permissions are also per VHost. 
The vhosts are unique for the whole RabbitMQ Cluster.  

**Some useful commands**  
 1. Creating a vhost rabbitmqctl add_vhost {vhost_name}  
 2. Delete a vhost rabbitmqctl delete_vhost {vhost_name} 
 3. Listing vhosts rabbitmqctl list_vhost 

rabbitmqctl lives under ./sbin/rabbitmqctl 

### Message durability / persistence  
By default messages are set to durable : false and will not survive a reboot/ server crash 
To persist them to disc you have to set the durable flag to true. 
For the message to survive the crash / reboot the message must be of type durable, the exchange must be also durable as well as the queue. 

Once the durable message has been delivered, it is flagged for garbage collection in the persistancy log.  
If server restarts anytime before you consume the persistant message it will be recreated and replayed again upon restart. 

Ok now with basic concept out of the way we can talk about what we want to achive next. 

## The project 

The project is a fictitious food delivery service, which are so prevalent nowadays in the startup scene, so I thought why not make one more. 

We shall allow registration to the service. The web application will delegate the rest of the registration process to a microservice which will work over RabbitMQ.  

I have choosen registration as this is the area that attracts changes most often in terms of background processes as to what happens after the user registers.  

The flow is as follows: 

1. User Registers 
2. The web app sends the message to the microservice responsible for saving registration details. 
3. Another microservice sends welcome email ..  and so on the rest you can just imagine. 

## The Implementation 

I have divided the project into the logical parts like publisher, subscriber and www representing Publisher process, Subsribing microservice and the web application responsible for the signups.  

[image of project structure]
 
We shall work with Wascally library to talk to RabbitMQ, this uses amqplib under the hood, but offers us a bit more abstraction over the basic ampq implementation done via amqplib, along that it also implements some concepts like message types which are not present in other libraries.  
I have tried both amqplib and wascally and I must say i did enjoy working with wascally a bit more. 

You can take a look at both code samples here  [links to git repos] for amqplib and wascally here [links to git repos]  

``` 
var express = require('express');
var router = express.Router();
var p = require('./../../../publisher/publisher');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Foodie'});
});

/* process the sign up */
router.post('/signup', function (req, res, next) {

    var publisher = new p();

    // send the message to teh publisher service
    //console.log(req.body);
    // return the user to the front page
    try {
        publisher.publish(req.body);
    } catch (err) {
        console.trace(err);
    }
    res.json('OK');
});

module.exports = router;

```

Here we see the post action processing the post requests from the signup form, the form itself is also port of the repository feel free to take a look at it.  

The publisher is the little module that setups wascally and creates a channel for publishing the messages to RabbitMQ. 
In this case we are not waiting for confirmation from the messaging service if the message has been processed, as basic validation already happen on the userform before submission.  

Now lets take a look at the publisher class, pay close attention to the comments in the code

```
/**
 * Created by Max Kimambo on 3/4/16.
 */
 
 // require wascally 
var mq = require('wascally');

// get the configuration 
var config = require('./../config/config');

function publisher (){

}

/**
* Creates the connection to RabbitMQ and assigns a message handler that 
* will publish the messages 
*/
publisher.prototype.publish = function(msg){
    mq.configure(config)
        .then(this.sendMessage(msg))
        .then(undefined, this.reportErrors);
};

publisher.prototype.reportErrors = function(err){
    console.log(err.stack);
    process.exit();
};

/**
* Send the actual message 
*/
publisher.prototype.sendMessage = function sendMessages(msg) {

    mq.publish(config.exchanges[0].name, {
        type: "orders.incoming.type",
        routingKey: "",
        body: msg
    });
};

module.exports = publisher;
```

We could have setup up multiple publishers for different purposes if that was a requirement. 

The exchange type could be modified from Direct to Fanout and additional microservices hooked up as subscribers to process the signup messages.  
 

 
