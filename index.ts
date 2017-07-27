import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { call, put, takeEvery } from 'redux-saga/effects'
import * as RTD from 'redux-typed-ducks';

import logger from './logger';
import fakeApi from './api';

// some types
type AppState = { isLoading: boolean, currentUser: string, error: string }

// the app state
const initialAppState: AppState = {
  isLoading: false,
  currentUser: '',
  error: ''
};

// the ducks
const userFetchRequest = RTD.createDuck('USER_FETCH_REQUESTED', (prev: AppState, payload: number) => {
  console.log(`REDUCER: userFetchRequest - enable loading state and reset error`);

  const next = Object.assign({}, prev, {
    isLoading: true,
    currentUser: '',
    error: ''
  });
  return next;
});

const userFetchSucceeded = RTD.createDuck('USER_FETCH_SUCCEEDED', (prev: AppState, payload: { username: string }) => {
  console.log(`REDUCER: userFetchSucceeded - disable loading state and set currentUser`);

  const next = Object.assign({}, prev, {
    isLoading: false,
    currentUser: payload.username
  });
  return next;
});

const userFetchFailed = RTD.createDuck('USER_FETCH_FAILED', (prev: AppState, payload: { message: string }) => {
  console.log(`REDUCER: userFetchFailed - disable loading state and set error`);

  const next = Object.assign({}, prev, {
    isLoading: true,
    error: payload.message
  });
  return next;
});

const ducks = {
  userFetchRequest,
  userFetchSucceeded,
  userFetchFailed
}

// worker Saga: will be fired on USER_FETCH_REQUESTED actions
function* fetchUser(action) {
   try {
    const user = yield call<number>(fakeApi.fetchUser, action.payload);
    // yield put({type: "USER_FETCH_SUCCEEDED", user: user});
    yield put(ducks.userFetchSucceeded(user));
   } catch (e) {
    // yield put({type: "USER_FETCH_FAILED", message: e.message});
    yield put(userFetchFailed(e as Error));
   }
}

function* watchFetchUser() {
  // yield takeLatest("USER_FETCH_REQUESTED", fetchUser);
  yield takeEvery(ducks.userFetchRequest.actionType, fetchUser);
}

// wiring up with redux store
const rootReducer = RTD.createReducer(ducks, initialAppState);
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  rootReducer,
  applyMiddleware(logger, sagaMiddleware)
);
const dispatchedActions = RTD.createDispatchedActions(ducks, store);

// bootstrap
sagaMiddleware.run(watchFetchUser);

// simulate UI interaction
console.log(`UI: Started. Get ready for some simulated interaction.`);

setTimeout(() => {
  console.log(`\n__________________`);
  console.log(`UI: Some one clicked a button to fetch user data for userId 23`);
  dispatchedActions.userFetchRequest(23);
}, 300);

setTimeout(() => {
  console.log(`\n__________________`);
  console.log(`UI: Some one clicked a button to fetch user data for userId 42 (which is expected to fail - see implementation of API)`);
  dispatchedActions.userFetchRequest(42);
}, 3500);
