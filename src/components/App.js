// state is stored both locally and in backend
// so using websocket connection we get initial state then update it whenever websocket pushes anything
// then state is updated locally and shit works out so we dont have to re-render the entire page whenever someone make a contribution

import React, { useEffect, useState } from 'react';
import InputField from './InputField';
import WordField from './WordField';

import '../App.css';
import '../WordField.css';
import '../InputField.css';

import socketIOClient from 'socket.io-client';

const App = () => {

  // STATE
  const initialWords = [{Word:"first", User:"god", Message:"keep praying for me"}]; // optional

  const [wordList, updateWordList] = useState(initialWords); // the list of words the gui is based on
  const [wordIsValid, updateWordValidity] = useState(true); // the validity of word we get from addWordToList
  // const [maker, updateMaker] = useState("");
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
  const validateThenAddWord = (word, user, message) => {
    //  e.preventDefault();


    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Word: word ,
        User: user,
        Message:message
      })
    }

    // TODO : idk how to get json from the response - I'm trying to get a bool which will
    // be used to decide whether dom is updated with new word or if word must be flagged as invalid

    // but idk how sockets work so imma learn the relationship between client / server using websockets\
    // then decide how i want to architect it once that is done


    socket.emit("new word", {Word: word, User : user, Message : message});

    // fetch("http://localhost:3200/addWord", fetchOptions).then((res) => {
    //   res.json().then((resJson) => {

    //     // declare state of form (1 : default (normal) or 2: invalid)
    //     updateWordValidity(resJson.validWord); // THIS IS UNDEFINED
    //     // if the word is valid add it
    //     // else we don't and pass in state to form so proper form can be shown

    //     // SPACES ADDED ALREEADY

    //     if (resJson.validWord) {
    //       const newWord = {"Word" : word, "User" : user, "Message" : message};
    //       updateWordList([...wordList, newWord]);
    //     }
    //   })
    // })
  }

  socket.on("add word", (word) => {
    console.log("WORD WE ARE ADDING : ", word)
    const newWord = {Word : word.Word, User : word.User, Message : word.Message};
    updateWordList([...wordList, newWord]);
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

    // fetch("http://localhost:3200/getAllWords")
    // .then(response => response.json())
    // .then(data => {
    //   console.log(data)
    //   console.log("wordlist before : ", wordList);
    //   // for each piece of data make a new word object (NOT A COMPONENT) and add it to wordList

    //   updateWordList(wordList => [...wordList, ...data]);
    //   console.log("wordlist after : ", wordList);

    // })

}, [])


  return (
    <>
      <h1>Welcome to Internet Story!</h1>
      <div className="mainArea">
        <WordField wordList={wordList}/>
        <InputField addWordToList={validateThenAddWord} wordIsValid={wordIsValid} />
      </div>

    </>
  );
}

export default App;