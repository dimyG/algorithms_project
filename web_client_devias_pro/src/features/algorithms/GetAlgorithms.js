import React from "react";
import {useEffect, useState} from "react";
import {getAlgorithmsThunk, getAllErrorSelector, getAllStatusSelector} from "./algorithmsSlice";
import {useSelector, useDispatch} from "react-redux";
import {useSnackbar} from "notistack";

// This component doesn't show anything on the page. It can be rendered whenever we want it to get the algorithms from the server
const GetAlgorithms = () => {
  const getAllStatus = useSelector(state => getAllStatusSelector(state))
  const getAllError = useSelector(state => getAllErrorSelector(state))
  const [numCalls, setNumCalls] = useState(0)
  const { enqueueSnackbar, closeSnackbar} = useSnackbar()
  const dispatch = useDispatch()

  useEffect(() => {
    // since useEffect can't be an async function you can declare it inside it and call it later on
    async function getItems(){
      await dispatch(getAlgorithmsThunk())
      setNumCalls(prevNumCalls => prevNumCalls + 1)
    }
    // Get items only on page load, not every time the component mounts.
    // This way you avoid the calls on back/forward operations to the component
    if (getAllStatus === 'idle'){
      const promise = getItems()
    }
  }, [])

  useEffect(() => {
    // if numCalls > 0 to avoid the issue of showing a previous error on mount
    if (numCalls > 0) {
      if (getAllStatus === 'failed' && getAllError) {
        enqueueSnackbar(getAllError, {variant: 'error'})
      }
    }
  }, [getAllStatus, getAllError, numCalls])

  return null
}

export default GetAlgorithms
