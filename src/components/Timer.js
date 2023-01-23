import React, { useEffect, useState } from 'react';

export default function Timer ({showTimer}) {
    const startingTime = 5;
    let [time, updateTime] = useState(startingTime);

    
    console.log("\nRERENDERING with showTimer set as ", showTimer)
    console.log("RENDERING with current time set as ", time)

    useEffect(() => {
        console.log("USE EFFECT CALLED")
        if(showTimer) startCounting();
        // else resetTimer();

    }, [])

    function startCounting() {
        updateTime(startingTime)
       // console.log("STARTING NEW TIMER : ", startingTime);
        const timer = setInterval(() => {
            // if timer runs out stop the timer 
            // if seconds is 0 turn to 59
            // else we just decrement seconds
            console.log("time in set interval : ", time)

            if(time == 0){
                console.log("clearing timer")
                return clearTimeout(timer);
            }
            else{
                console.log("drecrementing time to ", time - 1)
                console.log("time : ", time)
                updateTime((oldTime) => oldTime - 1) 
                time = time - 1; // for some reason time is updated outside of function but inside it stays the same 
                                 // so we update time inside function as well ??? 
                console.log("new time : ", time)          
            }

        }, 1000)
    }

    function resetTimer () {
        updateTime(startingTime);
    }

    return(
        <div className="timer">
            <div className="timeZone">
                <div>{time} seconds remaining</div>
            </div>
        </div>
    )
}