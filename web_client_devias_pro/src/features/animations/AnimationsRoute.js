import React, {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux";
import {algorithmByIdSelector, getAlgorithmThunk} from "../algorithms/algorithmsSlice";
import MinHeapAnimation from "./MinHeapAnimation";
import {Redirect} from "react-router";
import {minHeapId} from "../../constants";

const AnimationsRoute = ({match}) => {
  const dispatch = useDispatch()

  useEffect(() => {
    async function getItem(){
      await dispatch(getAlgorithmThunk({'id': algorithmId}))
    }
    // This is needed only if the algorithms list is empty. Get the algorithm so that it appears on the sidebar menu
    const promise = getItem()
  }, [])

  const algorithmId = parseInt(match.params.algorithmId)

  if (algorithmId === minHeapId) {
    return <MinHeapAnimation />
  } else {
    return <Redirect to = '/404' />
  }
}

export default AnimationsRoute
