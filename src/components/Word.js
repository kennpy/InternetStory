
// const Word = ({ word }) => {
//     console.log("word :" + word);
//     return (
//         <p className="pWord"> {word}</p >
//     );
// }

// export default Word;

import React, { useState } from "react";
import "./WordCard.css";


const Word = ({ word, maker, message }) => {
    const [isHover, setHover] = useState(false);

    const handleMouseEnter = () => setHover(true);
    const handleMouseLeave = () => setHover(false);

    console.log("word we are passing to word:", word);
    console.log("object type:", typeof word);
    console.log("object count:", (word.split(" ").length - 1));
    console.log("replace spaces:", word.replaceAll(" ", 'X'));

    return (
        <div className="word-card">
            <div
                className="word-card-word"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div style={{ whiteSpace: 'pre' }}>{word}</div>
            </div>
            {isHover && (
                <div className="word-card-tooltip">
                    <div className="word-card-maker">Made by: {maker}</div>
                    <div className="word-card-message">Message: {message}</div>
                </div>
            )}
        </div>
    );
};

export default Word;
