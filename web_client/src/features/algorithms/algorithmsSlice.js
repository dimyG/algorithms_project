import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'


export const getAlgorithms = createAsyncThunk('algorithms/get', async () => {
  const response = await axios.get('/algorithms/')
  console.log('getAlgorithmsThunk response:', response)
  return response.data
})

async function long(){
  console.log('running long task...')
  let i=0
  for (i; i<3*10**9; i++){
  }
  return i
}

export const createAlgorithm = createAsyncThunk('algorithms/create', async ({name, csrf_token}, {rejectWithValue}) => {
  // const long_result = await long()
  // console.log('long_result: ', long_result)
  const body = {'name': name}
  // have in mind that when using session authentication backend csrf token is only necessary for authenticated requests
  const config = {headers: {'X-CSRFToken': csrf_token}}
  try{
    const response = await axios.post('/algorithms/', body, config)
    console.log('createAlgorithmThunk response:', response)
    return response.data
  }catch (error) {
    console.log('createAlgorithmThunk error:', error, 'error.response:', error.response, 'error.response.data', error.response.data)
    // error.response is an object with config, data, headers, request, status and statusText attributes
    return rejectWithValue(error.response.data)
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
    get_status: 'idle',
    get_error: '',
    create_status: 'idle',
    create_error: '',
    list: [],
  },
  reducers: {},
  extraReducers: {
    [getAlgorithms.pending]: (state, action) => {
      state.get_status = 'loading'
    },
    [getAlgorithms.fulfilled]: (state, action) => {
      state.get_status = 'succeeded'
      state.list = state.list.concat(action.payload)
    },
    [getAlgorithms.rejected]: (state, action) => {
      state.get_status = 'failed'
      state.get_error = action.error.message
    },
    [createAlgorithm.pending]: (state, action) => {
      state.create_status = 'loading'
    },
    [createAlgorithm.fulfilled]: (state, action) => {
      state.create_status = 'succeeded'
      state.list.push(action.payload)
    },
    [createAlgorithm.rejected]: (state, action) => {
      state.create_status = 'failed'
      // state.create_error = action.error.message
      // return rejectWithValue(errorPayload) causes the rejected action to use the errorPayload value as action.payload
      state.create_error = action.payload
    },
  }
})

export default algorithmsSlice.reducer