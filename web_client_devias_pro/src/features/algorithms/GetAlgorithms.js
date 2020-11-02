import React from "react";
import {useEffect, useState} from "react";
import {getAlgorithmsThunk, getAllErrorSelector, getAllStatusSelector} from "./algorithmsSlice";
import {useSelector, useDispatch} from "react-redux";
import {useSnackbar} from "notistack";

// get the algorithms whenever the App is rendered. The stored algorithms list is needed by many components and needs
// to always be filled with server data. This way you could visit directly a url that loads a component that uses the
// algorithms list, without first having to visit the url that renders the algorithms list component.
const GetAlgorithms = () => {
  const getAllStatus = useSelector(state => getAllStatusSelector(state))
  const getAllError = useSelector(state => getAllErrorSelector(state))
  const [numCalls, setNumCalls] = useState(0)
  const { enqueueSnackbar, closeSnackbar} = useSnackbar()

  const dispatch = useDispatch()

  // update the numCalls only when the get thunk completes its execution
  const get = async () => {
    await dispatch(getAlgorithmsThunk())
    setNumCalls(numCalls + 1)
  }

  useEffect(() => {
    // getting the items on 'idle' means getting them only the first time the component renders
    // This means that you need to reload the page to make a new get call.
    if (getAllStatus === 'idle') {
      const promise = get()
    }
  })

  useEffect(() => {
    if (numCalls > 0) {
      if (getAllStatus === 'failed' && getAllError) {
        enqueueSnackbar(getAllError, {variant: 'error'})
      }
    }
  }, [numCalls])

  return null
}

export default GetAlgorithms
