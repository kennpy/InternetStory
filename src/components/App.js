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
  const [enableSubmitButton, updateEnableSubmitButton] = useState(true);
  // const [word, updateWord] = useState("");
 // const [message, updateMessage] = useState("");


  // HELPER METHODS

  const socket = socketIOClient("http://localhost:3200", {
      withCredentials: true
});
  /**
   * adds word to list if it word is allowed by verifying in backend)
   * @param {string} word : the word we are trying to submit 
   */
  const sendWord = (word, user, message) => {
    // e.preventDefault();

    socket.emit("new word", {Word: word, User : user, Message : message});
  }

  socket.on("add word", (word) => {
    console.log("WORD WE ARE ADDING : ", word)
    const newWord = {Word : word.Word, User : word.User, Message : word.Message};
    updateWordList([...wordList, newWord]);
    updateWordValidity(true); // update work validity to re-render timer stored in InputField component
    updateShowTimer(true)
    console.log("showing timer")
    setTimeout(() => {
      console.log("hiding timer")
      updateShowTimer(false)
    }, msBetweenSubmits)
  })

  socket.on("show invalid form", () => {
    updateWordValidity(false);
  }) 

  // on initial page load get all the form data and update the wordlist
  // we do this so we are not requesting the entire db on subsequent web pings
useEffect(() => {
    // delete what is there so we dont repeat inserts
    updateWordList(() => initialWords);
    console.log("word state after clearing : ", wordList)

    // get the initial data
    console.log("\n!!Getting form data !!\n");
    socket.on("newcon", data => {
          console.log("recieved new data : ", data)
          updateWordList(wordList => [...wordList, ...data]);
    })

    return () => socket.disconnect();
}, [])


  return (
    <>
      <h1>Welcome to Internet Story!</h1>
      <div className="mainArea">
        <WordField wordList={wordList}/>
        <InputField addWordToList={sendWord} wordIsValid={wordIsValid} showTimer={showTimer} updateShowTimer={updateShowTimer} />
      </div>

    </>
  );
}

export default App;