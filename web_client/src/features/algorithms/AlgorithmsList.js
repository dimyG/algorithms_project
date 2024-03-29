import React, { useEffect } from 'react'
import {useSelector, useDispatch} from "react-redux";
import {getAlgorithms} from "./algorithmsSlice";

export const AlgorithmsList = () => {
    const dispatch = useDispatch()
    const algorithms_list = useSelector(state => state.algorithms.list)
    const get_status = useSelector(state => state.algorithms.get_status)
    const get_error = useSelector(state => state.algorithms.get_error)

    // Todo try to use Suspense (instead of loading data in useEffect and manually handling the loading state)

    useEffect(() => {
        if (get_status === 'idle'){
            dispatch(getAlgorithms())
        }
    })

    const rendered_algorithms = algorithms_list.map(algorithm => (
        <div key={algorithm.name}>{algorithm.id}: {algorithm.name}</div>
    ))

    let content

    if (get_status === 'failed'){
        content = get_error
    }else if( get_status === 'loading'){
        content = 'loading...'
    }else if (get_status === 'succeeded'){
        content = rendered_algorithms
    }

    return (
        <div>
            <span>algorithms</span><br/>
            <span>{content}</span>
        </div>
    )
}
