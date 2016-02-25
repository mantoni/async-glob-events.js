# Changes

## 1.5.0

- Pull in `emitError` from `glob-events@1.6`
- Use `emitError` when an exception is caught

## 1.4.0

- Explicitly depend on `glob-events@1.5`

## 1.3.1

- Use `this.invoke` for internal events instead of super implementation

## 1.3.0

- Pass `opts` to super constructor
- Treat internal events special and don't pass a callback

## 1.2.0

- Expose `emitter` on scope

## 1.1.0

- Refactor parts of `emit` into the new `invoke` override

## 1.0.1

- Don't swallow errors

## 1.0.0

- Use `glob-events` 1.0
- Allow to configure the scope to use on listener registration

## 0.2.0

- Bump `glob-events` to 0.5

## 0.1.1

- Pass 'removeListener' events to super

## 0.1.0

- Initial release
