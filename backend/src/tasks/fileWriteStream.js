const fs = require('fs');

module.exports = (name, options = { flags: 'w' }) => {
  const stream = fs.createWriteStream(name, options);
  let lines = 0;
  return {
    write: data => {
      lines++;
      stream.write(`${JSON.stringify(data)}\n`);
    },
    lines: () => lines,
    end: () => stream.end()
  };
};
