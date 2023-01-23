import React from 'react';
import Word from './Word.mjs';
import PropTypes from 'prop-types'; // ES6
import '../App.css';


// List of words that's already been validated in 
const WordField = ({ wordList }) => {

    let kVal = 0;
    let listOfWordItems = wordList.map((wordObject) => {
        kVal++;
        let wordPlusSpace = " ".concat(wordObject.Word); 
        return <Word word={wordPlusSpace} maker={wordObject.User} message={wordObject.Message} key={kVal} /> 
    })

    return (
        <>
            <div className="mainBox">
                {listOfWordItems}
            </div>
        </>
    );
}

WordField.propTypes = {
    wordList: PropTypes.array,
}

export default WordField;