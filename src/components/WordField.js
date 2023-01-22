import React from 'react';
import Word from './Word.mjs';
import PropTypes from 'prop-types'; // ES6
import '../App.css';


// List of words that's already been validated in 
const WordField = ({ wordList }) => {

    console.log("wordlist prop in WordField component : ", wordList)
    let kVal = 0;
    let listOfWordItems = wordList.map((wordObject) => {
        kVal++;
        let wordPlusSpace = " ".concat(wordObject.Word); 
        console.log(wordObject)
        return <Word word={wordPlusSpace} maker={wordObject.User} message={wordObject.Message} key={kVal} /> 
    })
    // let listOfWordItems = wordList.map((word) => {
    //     kVal++;
    //     word = " ".concat(word);
    //     return <Word className="aWord" word={word} maker key={kVal.toString()} />
    // })

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