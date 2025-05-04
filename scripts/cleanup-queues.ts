// scripts/cleanup-queues.js
import amqp from 'amqplib';

async function cleanupQueues() {
  console.log('Starting RabbitMQ queue cleanup...');

  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(
      'amqp://rabbitmq:rabbitmq@localhost:5672',
    );
    const channel = await connection.createChannel();

    // List of queues to delete
    const queuesToDelete = ['main_queue'];

    // Delete each queue
    for (const queue of queuesToDelete) {
      try {
        console.log(`Deleting queue: ${queue}`);
        await channel.deleteQueue(queue);
        console.log(`Successfully deleted queue: ${queue}`);
      } catch (err) {
        console.error(`Error deleting queue ${queue}: ${err.message}`);
        // Continue with other queues even if one fails
      }
    }

    // Close connection
    await channel.close();
    await connection.close();

    console.log('Queue cleanup completed successfully!');
  } catch (error) {
    console.error(`Error during queue cleanup: ${error.message}`);
    process.exit(1);
  }
}

// Run the cleanup
cleanupQueues();
