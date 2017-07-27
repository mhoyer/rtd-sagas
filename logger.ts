// from http://redux.js.org/docs/advanced/Middleware.html#the-final-approach
const logger = store => next => action => {
  const payload = action.payload
    ? `with payload: ${JSON.stringify(action.payload)}`
    : '';

  console.log(`LOGGER: dispatching '${action.type}'`, payload);
  let result = next(action)
  console.log('LOGGER: next state =', JSON.stringify(store.getState(), null, 2));
  return result
}

export default logger;