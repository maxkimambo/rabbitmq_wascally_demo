module.exports = {
    "connection": {
        "user": "guest",
        "pass": "guest",
        "server": "localhost",
        "vhost": ""
    },
    "exchanges": [
        {
            "name": "orders.main",
            "type": "direct"
        }
    ],
    "queues": [
        {
            "name": "orders-q.1"
        }
    ],
    "bindings": [
        {
            "exchange": "orders.main",
            "target": "orders-q.1"
        }
    ]
};
