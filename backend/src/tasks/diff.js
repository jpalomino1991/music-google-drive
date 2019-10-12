const LineReader = require('line-by-line');
const fs = require('fs');
const fileWriteStream = require('./fileWriteStream');

let a = 5;

const gg = () => {
  const lineReader1 = new LineReader(
    `./src/temp/2songs_13ov24loNOhJTgLdeobhJUbQn9hw-dGzg`
  );
  const lineReader2 = new LineReader(
    `./src/temp/1songs_13ov24loNOhJTgLdeobhJUbQn9hw-dGzg`
  );
  const diffStream1 = fileWriteStream(`./src/temp/diffs1`);
  const diffStream2 = fileWriteStream(`./src/temp/diffs2`);

  let obj1 = {};
  let obj2 = {};
  let close1;
  let close2;

  lineReader1.on('line', async line => {
    const parsed = JSON.parse(line);
    obj1[parsed.id] = parsed;
  });

  lineReader2.on('line', async line => {
    const parsed = JSON.parse(line);
    obj2[parsed.id] = parsed;
  });

  lineReader1.on('end', () => {
    close1 = true;
    close();
  });
  lineReader2.on('end', () => {
    close2 = true;
    close();
  });

  const close = () => {
    console.log(close1, close2);
    if (!close1 || !close2) return;
    let d = [];
    Object.keys(obj1).forEach(k => {
      if (!obj2[obj1[k].id]) {
        d.push(obj1[k]);
      }
    });
    d.forEach(l => {
      diffStream1.write(l);
    });
    diffStream1.end();
    d = [];
    Object.keys(obj2).forEach(k => {
      if (!obj1[obj2[k].id]) {
        d.push(obj2[k]);
      }
    });
    d.forEach(l => {
      diffStream2.write(l);
    });
    diffStream2.end();
    d = [];
  };
};

module.exports = gg;
