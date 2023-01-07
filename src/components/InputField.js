import React, { useState } from 'react';

const InputField = ({ addWordToList: verifyThenAdd, wordIsValid }) => {
    // Create state variables to store the values of the word, name, and message inputs
    const [word, updateWord] = useState("");
    const [name, updateName] = useState("");
    const [message, updateMessage] = useState("");
    // Store the value of wordIsValid in a separate variable
    let showValidForm = wordIsValid;

    // Update the state variables for word, name, and message when the corresponding input values change
    const setNewInputText = (e) => {
        if (e.target.name === "word") {
            updateWord(e.target.value)
        } else if (e.target.name === "name") {
            updateName(e.target.value);
        } else if (e.target.name === "message") {
            updateMessage(e.target.value);
        }
    }

    // Prevent the default form submission behavior and call the addWordToList method with the values of the word, name, and message inputs
    const preventDefaultThenUpdate = (e) => {
        e.preventDefault();
        showValidForm = false;
        verifyThenAdd(word, name, message);
    }

    // Display an error message if the word input is invalid
    const invalidHeader = <p>PLEASE ENTER VALID WORD</p>;

    // Render the input fields for word, name, and message, along with the submit button
    return (
        <>
            <div className="totalField">
                <form onSubmit={preventDefaultThenUpdate}>
                    {showValidForm ? null : invalidHeader}
                    <label for="wordInput">Word : </label>
                    <input type='text' id="wordInput" name="word" value={word} onChange={setNewInputText} maxLength={20} minLength={1} autoFocus></input>
                    <label for="nameInput">Name : </label>
                    <input type='text' id="nameInput" name="name" value={name} onChange={setNewInputText} maxLength={20} minLength={1}></input>
                    <label for="messageInput">Message : </label>
                    <input type='text' id="messageInput" name="message" value={message} onChange={setNewInputText} maxLength={20} minLength={1}></input>
                    <button type='submit'>Submit</button>
                </form>
            </div>
        </>
    )
}

export default InputField;
