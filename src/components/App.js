// state is stored both locally and in backend
// so using websocket connection we get initial state then update it whenever websocket pushes anything
// then state is updated locally and shit works out so we dont have to re-render the entire page whenever someone make a contribution

import React, { useEffect, useState} from 'react';
import InputField from './InputField';
import WordField from './WordField';


import '../App.css';
import '../WordField.css';
import '../InputField.css';

import socketIOClient from 'socket.io-client';

const App = () => {

  // STATE
  const initialWords = [{Word:"Once upon a time", User:"God", Message:"Stay faithful"}]; // optional
  const msBetweenSubmits = 5000;

  const [wordList, updateWordList] = useState(initialWords); // the list of words the gui is based on
  const [wordIsValid, updateWordValidity] = useState(true); // the validity of word we get from addWordToList
  const [showTimer, updateShowTimer] = useState(false); 

  // !! Multiple connections are made per user.
  // render relies on sendWord which relies on socket and I don't know how to get around this
  // so for now we are sticking with this inneficiency 
  const socket = socketIOClient("http://localhost:3200", {
      withCredentials: true
  });
  /**
   * adds word to list if it word is allowed by verifying in backend)
   * @param {string} word : the word we are trying to submit 
   */
  const sendWord = (word, user, message) => {
    socket.emit("new word", {Word: word, User : user, Message : message});
  }

  // on initial page load get all the form data and update the wordlist
  // we do this so we are not requesting the entire db on subsequent web pings
useEffect(() => {
      // delete what is there so we dont repeat inserts
      updateWordList(() => initialWords);
      // get the initial data
      socket.on("newcon", data => {
            updateWordList(wordList => [...wordList, ...data]);
      })

      socket.on("add word", (word) => {
        const newWord = {Word : word.Word, User : word.User, Message : word.Message};
        updateWordList([...wordList, newWord]); // add the word to the screen
        updateWordValidity(true); // hide invalid form header in input field
        updateShowTimer(true) // show countdown timer until next submission 
        // hide the timer after timer runs out
        setTimeout(() => {
          updateShowTimer(false)
        }, msBetweenSubmits)
      })
    
      socket.on("show invalid form", () => {
        updateWordValidity(false); // show invalid header
      }) 

      return () => socket.disconnect();
    }, [])
 
  return (
    <>
      <h1>Welcome to Internet Story!</h1>
      <div className="mainArea">
        <WordField wordList={wordList}/>
        <InputField addWordToList={sendWord} wordIsValid={wordIsValid} showTimer={showTimer} />
      </div>

    </>
  );
}

export default App;