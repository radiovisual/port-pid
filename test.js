/* eslint prefer-destructuring: 0 */
const arrayUnique = require('array-unique');
const server = require('express')();
const portpids = require('.');

describe('expectations', () => {
  test('expects a port number', () => {
    expect(() => {
      portpids({});
    }).toThrow();
  });

  test('returns empty objects on error', async () => portpids(-1).then((pids) => {
    expect.assertions(3);

    expect(Array.isArray(pids.all) && pids.all.length === 0).toEqual(true);
    expect(Array.isArray(pids.tcp) && pids.tcp.length === 0).toEqual(true);
    expect(Array.isArray(pids.udp) && pids.udp.length === 0).toEqual(true);
  }));
});

describe('gets the pids', () => {
  let listener;
  let port;

  beforeEach(() => {
    listener = server.listen(0);
    port = listener.address().port;
  });

  afterEach(() => {
    listener.close();
  });

  test('gets the pids', async () => portpids(port).then((pids) => {
    expect.assertions(4);

    expect(pids.all.length > 0).toEqual(true);
    expect(typeof pids.all[0]).toEqual('number');
    expect(pids.tcp.length > 0).toEqual(true);
    expect(typeof (pids.tcp[0])).toEqual('number');
  }));
});

describe('no duplicates', () => {
  let listener;
  let port;

  beforeEach(() => {
    listener = server.listen(0);
    port = listener.address().port;
  });

  afterEach(() => {
    listener.close();
  });

  test('doesnt push duplicate entries', async () => portpids(port).then((pids) => {
    expect.assertions(3);

    expect(pids.all).toMatchObject(arrayUnique(pids.all));
    expect(pids.tcp).toMatchObject(arrayUnique(pids.tcp));
    expect(pids.udp).toMatchObject(arrayUnique(pids.udp));
  }));
});
