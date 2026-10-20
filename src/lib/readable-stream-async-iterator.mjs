// Polyfill: `for await (const chunk of readableStream)`.
// pdf.js relies on it (text layer, decompression), but Safari doesn't support async
// iteration of ReadableStream yet, and pdf.js' legacy build doesn't polyfill it.
// Plain JS so the same file can be loaded by the pdf.js worker (copied to public/).
if (typeof ReadableStream !== "undefined" && !ReadableStream.prototype[Symbol.asyncIterator]) {
  ReadableStream.prototype.values = function values({ preventCancel = false } = {}) {
    const reader = this.getReader();
    return {
      async next() {
        try {
          const result = await reader.read();
          if (result.done) reader.releaseLock();
          return result;
        } catch (err) {
          reader.releaseLock();
          throw err;
        }
      },
      async return(value) {
        if (preventCancel) {
          reader.releaseLock();
        } else {
          const cancelled = reader.cancel(value);
          reader.releaseLock();
          await cancelled;
        }
        return { done: true, value };
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  };
  ReadableStream.prototype[Symbol.asyncIterator] = ReadableStream.prototype.values;
}
