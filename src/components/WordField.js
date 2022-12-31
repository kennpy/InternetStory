import React, { useState } from 'react';
import Word from './Word';
import '../App.css';


// List of words that's already been validated in 
const WordField = ({ wordList }) => {

    let kVal = 0;
    let listOfWordItems = wordList.map((word) => {
        kVal++;
        word = " ".concat(word);
        return <Word className="aWord" word={word} key={kVal.toString()} />
    })

    return (
        <>
            <div className="mainBox">
                {listOfWordItems}

            </div>
        </>
    );
}

export default WordField;