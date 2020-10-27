import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'

async function long(){
  console.log('running long task...')
  let i=0
  for (i; i<1*10**9; i++){
  }
  return i
}

export const getAlgorithmsThunk = createAsyncThunk('algorithms/get', async () => {
  const response = await axios.get('/algorithms/')
  console.log('getAlgorithmsThunk response:', response)
  return response.data
})

export const createAlgorithmThunk = createAsyncThunk('algorithms/create', async ({name, csrf_token}, {rejectWithValue}) => {
  // const long_result = await long()
  // console.log('long_result: ', long_result)
  const body = {'name': name}
  // have in mind that when using session authentication backend csrf token is only necessary for authenticated requests
  const config = {headers: {'X-CSRFToken': csrf_token}}
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

export const algorithmsSlice = createSlice({
  name: 'algorithms',
  initialState: {
    get: {
      status: 'idle',
      error: ''
    },
    create: {
      status: 'idle',
      error: ''
    },
    list: [],
  },
  reducers: {},
  extraReducers: {
    [getAlgorithmsThunk.pending]: (state, action) => {
      state.get.status = 'loading'
    },
    [getAlgorithmsThunk.fulfilled]: (state, action) => {
      state.get.status = 'succeeded'
      state.list = state.list.concat(action.payload)
    },
    [getAlgorithmsThunk.rejected]: (state, action) => {
      state.get.status = 'failed'
      state.get.error = action.error.message
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
  }
})

export const algorithmsSelector = state => state.algorithms.list
export const getErrorSelector = state => state.algorithms.get.error
export const getStatusSelector = state => state.algorithms.get.status
export const createErrorSelector = state => state.algorithms.create.error
export const createStatusSelector = state => state.algorithms.create.status

export default algorithmsSlice.reducer
