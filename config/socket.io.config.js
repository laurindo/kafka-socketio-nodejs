const kafka         = require('kafka-node');
const Consumer      = kafka.Consumer;
const ClientKafka   = new kafka.Client(process.env.KAFKA_SERVER_URL);
const Producer      = new kafka.HighLevelProducer(ClientKafka);

const _getConsumer = () => {
    let topic = 'socketTopicTest';
    return new Consumer(ClientKafka, [{ topic: topic, partition: 0 }], {autoCommit: true});
};

const _openChatConnection = (io, consumer) => {
    io.on('connection', (socket) => {
        //Listen socket.io frontend
        socket.on('subscribe_front', (data) => {
            console.log(data);
        });
        //Listen kafka producer
        consumer.on('message', function(data) {
            socket.emit('send_task', JSON.parse(data.value));
        });
    });
};

const _getTopic = () => {
    return new Promise((resolve, reject) => {
        Producer.on('ready', function(errProducer, dataProducer) {
            Producer.createTopics(['socketTopicTest'], true, function (err, data) {
                if (!err) {
                    resolve(true);
                } else {
                    reject();
                }
            });
        })
    });
};

module.exports = {
    init: (io) => {
        try {
            _getTopic().then(topicIsCreated => {
                let consumer = _getConsumer();
                _openChatConnection(io, consumer);
            }).then(err => {
                console.log(err);
            });            
        } catch (e) {
            console.log(e);
        }
    }
};