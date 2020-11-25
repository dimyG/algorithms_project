import React from 'react'
import {useSelector} from "react-redux";
import {algorithmByIdSelector} from "../algorithms/algorithmsSlice";
import MinHeapAnimation from "./MinHeapAnimation";
import {Redirect} from "react-router";
import {minHeapId} from "../../constants";

const AnimationsRoute = ({match}) => {
  // const algorithm = useSelector(state => algorithmBySlugSelector(state, match.params.algorithmSlug))
  const algorithm = useSelector(state => algorithmByIdSelector(state, match.params.algorithmId))
  console.log("algorithm:", algorithm, "id:", match.params.algorithmId)

  if (!algorithm || !algorithm.has_animation) {
    return <Redirect to = '/404' />
  } else if (algorithm.id === minHeapId) {
    return <MinHeapAnimation />
  } else {
    return <Redirect to = '/404' />
  }
}

export default AnimationsRoute
