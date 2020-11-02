import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'
import _ from 'lodash'

async function long(){
  console.log('running long task...')
  let i=0
  for (i; i<1*10**9; i++){
  }
  return i
}

// Have in mind:
// payloadCreator is a callback function that should return a promise containing the result of some asynchronous logic.
// It may also return a value synchronously. If there is an error, it should either return a rejected promise
// containing an Error instance or a plain value such as a descriptive error message or otherwise a resolved promise
// with a RejectWithValue argument as returned by the thunkAPI.rejectWithValue function.
export const getAlgorithmsThunk = createAsyncThunk('algorithms/get', async (dummy, {rejectWithValue}) => {
  try {
    const response = await axios.get('/algorithms/')
    // console.log('getAlgorithmsThunk response:', response)
    return response.data
  }catch (error) {
    // console.log('getAlgorithmsThunk error', JSON.stringify(error))
    return rejectWithValue(error.message)
  }
})

export const createAlgorithmThunk = createAsyncThunk('algorithms/create', async ({name, csrfToken}, {rejectWithValue}) => {
  // const long_result = await long()
  // console.log('long_result: ', long_result)
  const body = {'name': name}
  // have in mind that when using session authentication backend csrf token is only necessary for authenticated requests
  const config = {headers: {'X-CSRFToken': csrfToken}}
  try{
    const response = await axios.post('/algorithms/', body, config)
    // console.log('createAlgorithmThunk response:', response)
    return response.data
  }catch (error) {
    // console.log('createAlgorithmThunk error:', error, 'error.response:', error.response, 'error.response.data', error.response.data)
    // error.response is an object with config, data, headers, request, status and statusText attributes

    // in case of 403, for example csrf error, then return the given message instead of the error data which is an html page
    const forbidden_msg = "Your request was forbidden"
    let error_payload
    error.response.status === 403 ? error_payload = forbidden_msg : error_payload = error.response.data
    return rejectWithValue(error_payload)
  }
    // this is a stackoverflow answer for handling django validation error's and more. An equivalent
    // approach could be used with the async/await syntax instead of .then and the use of rejectWithValue
    // axios.post('/algorithms/', body, config)
    // .then(response => {
    //   console.log('createAlgorithmThunk response', response)
    //   return (response.data)
    // })
    // .catch(function (error) {
    //   if (error.response) {
    //     // The request was made and the server responded with a status code
    //     // that falls out of the range of 2xx
    //     console.log(error.response.data);
    //     console.log(error.response.status);
    //     console.log(error.response.headers);
    //   } else if (error.request) {
    //     // The request was made but no response was received
    //     // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    //     // http.ClientRequest in node.js
    //     console.log(error.request);
    //   } else {
    //     // Something happened in setting up the request that triggered an Error
    //     console.log('Error', error.message);
    //   }
    //   console.log(error.config);
    // });
})

export const updateAlgorithmThunk = createAsyncThunk("algorithms/update", async ({id, name, csrfToken}, {rejectWithValue}) => {
  const body = {'id': id, 'name': name}
  const config = {headers: {'X-CSRFToken': csrfToken}}
  try {
    // the trailing slash is needed by django in PUT requests
    const response = await axios.put(`/algorithms/${id}/`, body, config)
    console.log("edit algorithm thunk response:", response)
    return response.data
  } catch (error) {
    console.log("edit algorithm thunk error:", JSON.stringify(error))
    return rejectWithValue(error.message)
  }
})

export const getAlgorithmThunk = createAsyncThunk("algorithm/get", async ({id}, {rejectWithValue}) => {
  const body = {'id': id}
  try {
    const response = await axios.get(`/algorithms/${id}`, body)
    console.log("get algorithm thunk response:", response)
    return response.data
  } catch (error) {
    console.log("get algorithm thunk error:", JSON.stringify(error))
    return rejectWithValue(error.message)
  }
})

export const algorithmsSlice = createSlice({
  name: 'algorithms',
  initialState: {
    get_all: {
      status: 'idle',
      error: ''
    },
    get: {
      status: 'idle',
      error: ''
    },
    create: {
      status: 'idle',
      error: ''
    },
    update: {
      status: 'idle',
      error: ''
    },
    list: [],
  },
  reducers: {},
  extraReducers: {
    [getAlgorithmsThunk.pending]: (state, action) => {
      state.get_all.status = 'loading'
    },
    [getAlgorithmsThunk.fulfilled]: (state, action) => {
      state.get_all.status = 'succeeded'
      // state.list = _.union(state.list, action.payload)
      state.list = action.payload
    },
    [getAlgorithmsThunk.rejected]: (state, action) => {
      state.get_all.status = 'failed'
      state.get_all.error = action.payload
    },

    [getAlgorithmThunk.pending]: (state, action) => {
      state.get.status = 'loading'
    },
    [getAlgorithmThunk.fulfilled]: (state, action) => {
      state.get.status = 'succeeded'
      // if the algorithm exist in the store update it with the latest server data, else add it
      const algorithmIndex = state.list.indexOf(action.payload)
      if (algorithmIndex > -1){
        state.list[algorithmIndex] = action.payload
      }else{
        state.list.push(action.payload)
      }
    },
    [getAlgorithmThunk.rejected]: (state, action) => {
      state.get.status = 'failed'
      state.get.error = action.payload
    },

    [createAlgorithmThunk.pending]: (state, action) => {
      state.create.status = 'loading'
    },
    [createAlgorithmThunk.fulfilled]: (state, action) => {
      state.create.status = 'succeeded'
      state.list.push(action.payload)
    },
    [createAlgorithmThunk.rejected]: (state, action) => {
      state.create.status = 'failed'
      // state.create.error = action.error.message
      // return rejectWithValue(errorPayload) causes the rejected action to use the errorPayload value as action.payload
      state.create.error = action.payload
    },
    [updateAlgorithmThunk.pending]: (state, action) => {
      state.update.status = 'loading'
    },
    [updateAlgorithmThunk.fulfilled]: (state, action) => {
      state.update.status = 'succeeded'
      state.list.map((algorithm, index, list_ref) => {
        if (algorithm.id === action.payload.id){
          list_ref[index] = action.payload
        }
      })
    },
    [updateAlgorithmThunk.rejected]: (state, action) => {
      state.update.status = 'failed'
      state.update.error = action.payload
    },
  }
})

export const algorithmsSelector = state => state.algorithms.list
export const getAllErrorSelector = state => state.algorithms.get_all.error
export const getAllStatusSelector = state => state.algorithms.get_all.status
export const getErrorSelector = state => state.algorithms.get.error
export const getStatusSelector = state => state.algorithms.get.status
export const createErrorSelector = state => state.algorithms.create.error
export const createStatusSelector = state => state.algorithms.create.status

export default algorithmsSlice.reducer
