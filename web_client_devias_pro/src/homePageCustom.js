import React from 'react';
import {AlgorithmsList} from 'src/features/algorithms/AlgorithmsList'
import {AlgorithmForm} from 'src/features/algorithms/AlgorithmForm';

const HomePageCustom = () => {
    return(
        <div>
            <AlgorithmsList/>
            <AlgorithmForm/>
        </div>
    )
}

export default HomePageCustom
