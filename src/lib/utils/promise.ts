/**
 * Promiseを握り潰さないためのユーティリティ
 * .catchを使わずにPromiseを消費する
 */
export const consumePromise = <T>(promise: Promise<T>): void => {
  void promise.catch((error: unknown) => {
    console.warn("Unhandled promise rejection:", error);
  });
};
