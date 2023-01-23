import React, { useEffect, useState } from 'react';

export default function Timer ({showTimer}) {
    const startingTime = 5;
    let [time, updateTime] = useState(startingTime);

    useEffect(() => {
        if(showTimer) startCounting();
    }, [])

    function startCounting() {
        updateTime(startingTime)
        const timer = setInterval(() => {
            // if timer runs out desstroy the timer 
            // else we just decrement seconds
            if(time == 0){
                return clearTimeout(timer); 
            }
            else{
                updateTime((oldTime) => oldTime - 1) 
                time = time - 1; // for some reason time is updated outside of function but inside it stays the same 
                                 // so we update time inside function as well          
            }
        }, 1000)
    }
    
    return(
        <div className="timer">
            <div className="timeZone">
                {time} seconds remaining
            </div>
        </div>
    )
}