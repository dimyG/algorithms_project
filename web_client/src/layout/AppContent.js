import React from 'react';
import logo from '../logo.svg';
import {AlgorithmsList} from '../features/algorithms/AlgorithmsList'
import {AlgorithmForm} from "../features/algorithms/AlgorithmForm";
import {Csrf} from "../features/csrf/csrf";

const AppContent = () => {
    return(
        <div>
            <Csrf/>
            <AlgorithmsList/>
            <AlgorithmForm/>
        </div>
    )
}

export default AppContent