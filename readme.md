# node-ssh-reboot-test

Attempting to repro https://github.com/steelbrain/node-ssh/issues/421.

## Description

When using the npm library `node-ssh` and executing a reboot command (i.e. `sudo reboot`), an error occurs but is not caught. The node process crashes with an error like this:

```
Error: read ECONNRESET
    at TCP.onStreamRead (node:internal/stream_base_commons:217:20) {
  errno: -4077,
  code: 'ECONNRESET',
  syscall: 'read',
  level: 'client-socket'
}
```

For me this only happens sometimes - I haven't found a pattern - it seems to happen maybe 1 out of every 4 or 5 times.

## Notes on Variables

Stuff I'm using (see package.json for versions):

- Node 18.18.0
- Typescript
- ts-node (with swc as the compiler - see tsconfig.json)
- Accessing an Ubuntu 20 instance on AWS Lightsail

## Setup and Run Test

- Run: `npm install`
- Copy `.env.template` to `.env` and update values

Run the test from @steelbrain:
```
npm run index
```
Things I changed in steelbrain's test:
- I added `.then().catch()` on main
- I'm connecting with privateKeyPath instead of password

I created another test with the error event listener commented out:

```
npm run another
```

## Results

I get different results for both of these tests when running them multiple times. For the "index" test I sometimes get the expected result:

```
{ code: 0, signal: null, stdout: 'hi', stderr: '' }
{ code: null, signal: null, stdout: '', stderr: '' }
no uncaught errors - exiting
```

But other times I get this:

```
{ code: 0, signal: null, stdout: 'hi', stderr: '' }
error Error: read ECONNRESET
    at TCP.onStreamRead (node:internal/stream_base_commons:217:20) {
  errno: -4077,
  code: 'ECONNRESET',
  syscall: 'read',
  level: 'client-socket'
}
{ code: null, signal: null, stdout: '', stderr: '' }
no uncaught errors - exiting
```

Note that it didn't crash the node process.

When I run the "another" test I sometimes get no errors:

```
{ code: 0, signal: null, stdout: 'hi', stderr: '' }
{ code: null, signal: null, stdout: '', stderr: '' }
no uncaught errors - exiting
```

But other times I get this:

```
{ code: 0, signal: null, stdout: 'hi', stderr: '' }
Error: read ECONNRESET
    at TCP.onStreamRead (node:internal/stream_base_commons:217:20) {
  errno: -4077,
  code: 'ECONNRESET',
  syscall: 'read',
  level: 'client-socket'
}
```

This is before I added the `process.on` listeners for `unhandledRejection` and `uncaughtException`. Even without those I would have expected at least the `catch` block to be hit, but it wasn't.

After adding the `process.on` listeners I tried 5 or 6 more times and wasn't getting any errors, but then finally got this:

```
{ code: 0, signal: null, stdout: 'hi', stderr: '' }
Caught exception: Error: read ECONNRESET
Exception origin: uncaughtException
```
Note that this time the `.then().catch()` is never hit, but the `process.on` event for `uncaughtException` IS hit. This doesn't seem like it should be expected. Omitting a handler for `ssh.connection?.on` event `error` shouldn't cause try/catch to fail.
