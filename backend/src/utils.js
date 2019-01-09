module.exports.sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));
