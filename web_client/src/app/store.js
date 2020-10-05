import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import algorithmsReducer from '../features/algorithms/algorithmsSlice'
import csrfReducer from '../features/csrf/csrfSlice'

export default configureStore({
  reducer: {
    counter: counterReducer,
    algorithms: algorithmsReducer,
    csrf: csrfReducer,
  },
});
