import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {unwrapResult} from "@reduxjs/toolkit";
import {createAlgorithm} from "./algorithmsSlice";
import {csrfSelector} from "../csrf/csrfSlice";

export const AlgorithmForm = () => {
    const dispatch = useDispatch()

    const create_status = useSelector(state => state.algorithms.create_status)
    const create_error = useSelector(state => state.algorithms.create_error)

    const csrf_token = useSelector(state => csrfSelector(state))
    // console.log('csrf_token:', csrf_token)

    const [name, setName] =  useState('')
    const onNameChange = e => {
        setName(e.target.value)
    }

    // you only need to make the onCreatePressed async if you want to await the thunk.
    // you would want to await the thunk in order to catch any asyncThunk internal errors with the unwrapResult function
    const onCreatePressed = () => {
        // in case of no error the thunk returns a resolved promise with a fulfilled action object
        // in case of error, the thunk returns a resolved promise with a rejected action object
        dispatch(createAlgorithm({'name': name, 'csrf_token': csrf_token}))
        // we don't use the try catch here. We use it inside the createAlgorithm payload creator so that we get the
        // server generated message
        // try{
        //     const create_result = await dispatch(createAlgorithm({'name': name, 'csrf_token': csrf_token}))
        //     unwrapResult(create_result)
        //     setName('')
        // }catch (error){
        //     // This error is the action.error that can be inspected in the redux dev tools window
        //     console.log('algorithm created caught error', error)
        // }
    }

    const can_save = (create_status === 'idle' || 'failed') && name !== ''
    let button
    // let disabled = ''
    // if (!can_save) disabled='disabled'
    if (can_save){
        button = <button type='button' onClick={onCreatePressed}>Create</button>
    }else{
        button = <button type='button' disabled onClick={onCreatePressed}>Create</button>
    }

    let error = null
    if (create_status === 'failed'){
        error = create_error
    }

    function NameError(props){
        if(!props.error) return null
        if (props.error && !props.error.name) return null
        return (
            <label>{props.error.name}</label>
        )
    }

    function Error(props){
        if(!props.error) return null
        if (props.error && !props.error.name) return (
            <label>{props.error}</label>
        )
        return null
    }

    return(
        <div>
            <form>
                <NameError error={error}/>
                <label htmlFor='algorithm_name'>Algorithm Name</label>
                    <input id='algorithm_name' type='text' name='algorithm_name' placeholder="algorithm's name"
                           value={name}
                           onChange={onNameChange}
                    />
                </form>
            {button}
            {/*button = <button type='button' {disabled} onClick={onCreatePressed}>Create</button>*/}
            <Error error={error}/>
        </div>
    )
}