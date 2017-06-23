'use strict';

const kafka         = require('kafka-node');
const ClientKafka   = new kafka.Client(process.env.KAFKA_SERVER_URL);
const Producer      = kafka.Producer;
const Client        = kafka.Client;

exports.hello = (req, res) => {
    res.status(200).send('hello');
};

exports.sendMessage = function (req, res) {
    let client          = new Client(process.env.KAFKA_SERVER_URL);
    let producer        = new Producer(client, {requireAcks: 1});
    const kafkaTopic    = req.query.topic || 'socketTopicTest';
    const kafkaMessage  = req.body;

    producer.on('ready', function () {
        producer.createTopics([kafkaTopic], true, function (errToCreateTopic, topicCreated) {
            if (!errToCreateTopic) {
                producer.send([{
                    topic: kafkaTopic, partition: 0, messages: [JSON.stringify(kafkaMessage)], attributes: 0
                }], function (err, result) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json(result);
                    }
                });
            } else {
                reject();
            }
        });        
    });

    producer.on('error', function (err) {
        res.status(500).json(err);
    });
};

