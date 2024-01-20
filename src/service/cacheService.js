const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 200, checkperiod: 210 });

module.exports = cache;