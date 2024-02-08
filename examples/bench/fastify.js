// Require the framework and instantiate it
const fastify = require('fastify')({ logger: false });

// Declare a route
fastify.get('/', function handler(request, reply) {
  reply.send('hello');
});

// Run the server!
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
