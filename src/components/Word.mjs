import React, { useState } from "react";
import PropTypes from 'prop-types'; // ES6
import "./WordCard.css";


const Word = ({ word, maker, message }) => {
    const [isHover, setHover] = useState(false);

    console.log("word props : ", word, maker, message);

    const handleMouseEnter = () => setHover(true);
    const handleMouseLeave = () => setHover(false);

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
                <div className="word-card">
                    <div className="word-card-tooltip">
                        <div className="word-card-maker">Made by: {maker}</div>
                        <div className="word-card-message">Message: {message}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

Word.propTypes = {
    word: PropTypes.string,
    maker: PropTypes.string,
    message: PropTypes.string
}

export default Word;
