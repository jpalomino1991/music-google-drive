const fs = require('fs');

module.exports = name => {
  const stream = fs.createWriteStream(name, {
    flags: 'w'
  });
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
