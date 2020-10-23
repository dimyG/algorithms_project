import React from "react";
import {useDispatch} from "react-redux";
import {get} from "./csrfSlice";
import {useEffect} from 'react'

export const Csrf = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(get())
    })

    return null
}