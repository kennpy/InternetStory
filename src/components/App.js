// state is stored both locally and in backend
// so using websocket connection we get initial state then update it whenever websocket pushes anything
// then state is updated locally and shit works out so we dont have to re-render the entire page whenever someone make a contribution

import React, { useState } from 'react';

import '../App.css';
import '../WordField.css';
import '../InputField.css';

import InputField from './InputField';
import WordField from './WordField'

const App = () => {

  // STATE
  const initialWords = ["first", "second"];
  const [wordList, updateWordList] = useState(initialWords); // the list of words the gui is based on
  const [wordIsValid, updateWordValidity] = useState(true); // the validity of word we get from addWordToList

  // HELPER METHODS

  /**
   * adds word to list if it word is allowed (verification happens in backend)
   * @param {string} word : the word we are trying to submit 
   */
  const addWordToList = (word) => {
    //  e.preventDefault();


    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        word: word
      })
    }

    // TODO : idk how to get json from the response - I'm trying to get a bool which will
    // be used to decide whether dom is updated with new word or if word must be flagged as invalid

    // but idk how sockets work so imma learn the relationship between client / server using websockets\
    // then decide how i want to architect it once that is done

    fetch("http://localhost:3200/addWord", fetchOptions).then((res) => {
      res.json().then((resJson) => {

        // declare state of form (1 : default (normal) or 2: invalid)
        updateWordValidity(resJson.validWord); // THIS IS UNDEFINED
        // if the word is valid add it
        // else we don't and pass in state to form so proper form can be shown
        const newWord = " ".concat(word)
        if (resJson.validWord) updateWordList(() => [...wordList, " ", newWord]);
      })
    })

  }

  return (
    <>
      <h1>Welcome to Internet Story!</h1>
      <div className="mainArea">
        <WordField wordList={wordList} />
        <InputField addWordToList={addWordToList} wordIsValid={wordIsValid} />
      </div>

    </>
  );
}

export default App;
