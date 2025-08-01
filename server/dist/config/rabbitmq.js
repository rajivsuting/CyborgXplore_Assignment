"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRabbitMQ = exports.consumeFromQueue = exports.publishToQueue = exports.getChannel = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = require("../utils/logger");
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://admin:password123@localhost:5672";
let connection;
let channel;
const connectRabbitMQ = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        connection = yield amqplib_1.default.connect(RABBITMQ_URL);
        channel = yield connection.createChannel();
        // Define queues
        yield channel.assertQueue("scan-jobs", {
            durable: true,
            arguments: {
                "x-message-ttl": 24 * 60 * 60 * 1000, // 24 hours
            },
        });
        yield channel.assertQueue("scan-results", {
            durable: true,
            arguments: {
                "x-message-ttl": 24 * 60 * 60 * 1000, // 24 hours
            },
        });
        // Handle connection events
        connection.on("error", (err) => {
            logger_1.logger.error("RabbitMQ connection error:", err);
        });
        connection.on("close", () => {
            logger_1.logger.warn("RabbitMQ connection closed");
        });
        logger_1.logger.info("RabbitMQ connected successfully");
    }
    catch (error) {
        logger_1.logger.error("Failed to connect to RabbitMQ:", error);
        throw error;
    }
});
exports.connectRabbitMQ = connectRabbitMQ;
const getChannel = () => {
    if (!channel) {
        throw new Error("RabbitMQ channel not initialized");
    }
    return channel;
};
exports.getChannel = getChannel;
const publishToQueue = (queueName, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const channel = (0, exports.getChannel)();
        yield channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
            persistent: true,
        });
        logger_1.logger.info(`Message published to queue: ${queueName}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to publish message to queue ${queueName}:`, error);
        throw error;
    }
});
exports.publishToQueue = publishToQueue;
const consumeFromQueue = (queueName, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const channel = (0, exports.getChannel)();
        yield channel.consume(queueName, (msg) => __awaiter(void 0, void 0, void 0, function* () {
            if (msg) {
                try {
                    const data = JSON.parse(msg.content.toString());
                    yield callback(data);
                    channel.ack(msg);
                }
                catch (error) {
                    logger_1.logger.error(`Error processing message from ${queueName}:`, error);
                    channel.nack(msg, false, true);
                }
            }
        }));
        logger_1.logger.info(`Consumer started for queue: ${queueName}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to start consumer for queue ${queueName}:`, error);
        throw error;
    }
});
exports.consumeFromQueue = consumeFromQueue;
const closeRabbitMQ = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (channel) {
            yield channel.close();
        }
        if (connection) {
            yield connection.close();
        }
        logger_1.logger.info("RabbitMQ connection closed");
    }
    catch (error) {
        logger_1.logger.error("Error closing RabbitMQ connection:", error);
    }
});
exports.closeRabbitMQ = closeRabbitMQ;
