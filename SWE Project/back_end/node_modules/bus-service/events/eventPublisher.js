const amqp = require('amqplib');

class EventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.connected = false;
  }

  async connect() {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Declare exchange for bus events
      await this.channel.assertExchange('bus_events', 'topic', { durable: true });
      
      this.connected = true;
      console.log('✅ Connected to RabbitMQ - Bus Events Exchange');

      // Handle connection errors
      this.connection.on('error', (err) => {
        console.error('❌ RabbitMQ connection error:', err);
        this.connected = false;
      });

      this.connection.on('close', () => {
        console.log('⚠️  RabbitMQ connection closed');
        this.connected = false;
        // Reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      });

    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error.message);
      this.connected = false;
      // Retry connection after 5 seconds
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(eventType, data) {
    if (!this.connected || !this.channel) {
      console.warn('⚠️  RabbitMQ not connected, event not published:', eventType);
      return false;
    }

    try {
      const message = JSON.stringify({
        eventType,
        data,
        timestamp: new Date().toISOString(),
        service: 'bus_service'
      });

      // Routing keys examples:
      // - bus.created
      // - bus.updated
      // - bus.deleted
      // - bus.status_changed
      // - bus.maintenance_scheduled
      // - bus.location_updated

      this.channel.publish(
        'bus_events',
        eventType, // routing key
        Buffer.from(message),
        { 
          persistent: true,
          contentType: 'application/json'
        }
      );

      console.log(`📤 Event published: ${eventType}`);
      return true;

    } catch (error) {
      console.error('❌ Error publishing event:', error);
      return false;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.connected = false;
      console.log('✅ RabbitMQ connection closed gracefully');
    } catch (error) {
      console.error('❌ Error closing RabbitMQ connection:', error);
    }
  }
}

module.exports = new EventPublisher();