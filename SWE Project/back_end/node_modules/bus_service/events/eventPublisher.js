// Minimal event publisher stub to avoid runtime import errors
module.exports = {
  async publish(topic, payload) {
    console.log(`[event] ${topic}`, payload);
  }
};


