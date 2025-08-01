import amqp from "amqplib";
import { logger } from "../utils/logger";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://admin:password123@localhost:5672";

let connection: any;
let channel: any;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Define queues
    await channel.assertQueue("scan-jobs", {
      durable: true,
      arguments: {
        "x-message-ttl": 24 * 60 * 60 * 1000, // 24 hours
      },
    });

    await channel.assertQueue("scan-results", {
      durable: true,
      arguments: {
        "x-message-ttl": 24 * 60 * 60 * 1000, // 24 hours
      },
    });

    // Handle connection events
    connection.on("error", (err: any) => {
      logger.error("RabbitMQ connection error:", err);
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
    });

    logger.info("RabbitMQ connected successfully");
  } catch (error) {
    logger.error("Failed to connect to RabbitMQ:", error);
    throw error;
  }
};

export const getChannel = (): any => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
};

export const publishToQueue = async (
  queueName: string,
  data: any
): Promise<void> => {
  try {
    const channel = getChannel();
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
    logger.info(`Message published to queue: ${queueName}`);
  } catch (error) {
    logger.error(`Failed to publish message to queue ${queueName}:`, error);
    throw error;
  }
};

export const consumeFromQueue = async (
  queueName: string,
  callback: (data: any) => Promise<void>
): Promise<void> => {
  try {
    const channel = getChannel();
    await channel.consume(queueName, async (msg: any) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await callback(data);
          channel.ack(msg);
        } catch (error) {
          logger.error(`Error processing message from ${queueName}:`, error);
          channel.nack(msg, false, true);
        }
      }
    });
    logger.info(`Consumer started for queue: ${queueName}`);
  } catch (error) {
    logger.error(`Failed to start consumer for queue ${queueName}:`, error);
    throw error;
  }
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    logger.info("RabbitMQ connection closed");
  } catch (error) {
    logger.error("Error closing RabbitMQ connection:", error);
  }
};
