const { Client } = require('@elastic/elasticsearch');

// Configure Elasticsearch Client (replace with your actual node)
// Consider moving this to a config file and using environment variables
const esClient = new Client({ node: 'http://localhost:9200' }); // Replace with your ES node URL

module.exports = esClient;