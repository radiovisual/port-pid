import test from 'ava';
import portpids from './';
const server = require('express')();
import arrayUnique from 'array-unique';

test.beforeEach(t => {
	const listener = server.listen(0);
	t.context.listener = listener;
	t.context.port = listener.address().port;
	console.log('running test server on port: ', t.context.port);
});

test('expect a port number', t => {
	t.throws(() => {
		portpids({});
	});
});

test('returns arrays', async t => {
	await portpids(t.context.port).then(pids => {
		t.plan(3);
		t.true(Array.isArray(pids.all));
		t.true(Array.isArray(pids.tcp));
		t.true(Array.isArray(pids.udp));
	});
});

test('gets the pids', async t => {
	await portpids(t.context.port).then(pids => {
		t.plan(4);

		t.true(pids.all.length > 0);
		t.true(!isNaN(pids.all[0]));
		t.true(pids.tcp.length > 0);
		t.true(!isNaN(pids.tcp[0]));
	});
});

test('doesnt push duplicate entries', async t => {
	await portpids(t.context.port).then(pids => {
		t.plan(3);

		t.is(pids.all, arrayUnique(pids.all));
		t.is(pids.tcp, arrayUnique(pids.tcp));
		t.is(pids.udp, arrayUnique(pids.udp));
	});
});

test.afterEach(t => {
	t.context.listener.close();
	console.log('closing test server on port: ', t.context.port);
});
