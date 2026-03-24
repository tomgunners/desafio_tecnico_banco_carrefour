declare module 'mochawesome/addContext' {
  function addContext(
    context: Mocha.Context,
    value: string | { title: string; value: unknown }
  ): void;
  export default addContext;
}
