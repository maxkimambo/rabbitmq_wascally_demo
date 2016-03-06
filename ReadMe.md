## Simple Demo of how to use Wascally to interact with RabbitMQ

The project consists of a simple webapp that allows the user to sign up, this information is passed to the publisher 
which in turn uses rabbitMQ to send a message to all the listening subscribers.  

This scenario could depict how the user signup process can be split up into different microservices  
e.g 1. Send confirmation email, then set a flag so that post is sent out, then setup user account with defaults etc etc. 

Having RabbitMQ allows us to extend the process easily as the requirements change without a lot of modification, 
just write a listener and you are good to go.  