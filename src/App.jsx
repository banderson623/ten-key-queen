import React from 'react'
import useSound from 'use-sound';

import { SoundOnIcon, SoundOffIcon } from './icons';
import { fireConfetti, launchFireworks, sparkDrip } from './confetti';
import { useLocalStorage } from './localstorage-hook';

const AudioContext = React.createContext(null);
const SteaksContext = React.createContext(null);

console.log(window.location.hash)

const GAME_MODE = window.location.hash.match(/mode=([a-z]+)/i)?.[1]?.toLowerCase() || 'easy';
console.log(GAME_MODE);

function generateTable(rows = 4, columns = 3) {
  console.log('game mode:', GAME_MODE)

  if (GAME_MODE.includes('small')) {
    rows = 2;
    columns = 2;
  }


  if (GAME_MODE.includes('hard')) {
    rows = 8;
    columns = 8;
  }

  const table = [];
  for (let row = 0; row < rows; row++) {
    const data = [];
    for (let column = 0; column < columns; column++) {
      const maxValue = GAME_MODE.includes('wild') ? '1000000' : 2000;

      data.push((Math.random() * maxValue).toFixed(2));
    }
    table[row] = data;
  }
  return table;
}

function GoalTable({ table }) {
  return (
    <div className="rounded-md shadow-md p-4 m-4 bg-white">
      <p className="text-center font-bold uppercase text-lg text-slate-400  mb-4">Goal</p>
      <table className="text-gray-500 font-mono">
        <tbody>
          {table.map((row, rowIndex) => (
            <tr className="" key={rowIndex}>
              {row.map((data, columnIndex) => <td
                key={columnIndex}
                className="border-2 border-gray-200 text-right">
                <span className="inline-block w-28 p-3 text-right">
                  {data}
                </span>
              </td>)}
            </tr>

          ))}
        </tbody>
      </table>
    </div>
  )
}

function CellEntry({ goal, focused, onChange }) {
  const inputRef = React.useRef(null);

  const [value, setValue] = React.useState("");
  const [isCorrect, setIsCorrect] = React.useState("");
  const [extraStyle, setExtraStyle] = React.useState("");
  const [soFarSoGood, setSoFarSoGood] = React.useState(false);

  const { audioEnabled } = React.useContext(AudioContext);
  const { onCorrectValueEntered, onWrongValueEntered, resetAllAnswersRequest } = React.useContext(SteaksContext);

  const [playKey] = useSound('./bite.mp3', { volume: 0.5, soundEnabled: audioEnabled });
  const [playSuccess] = useSound('./success.mp3', { volume: 0.35, soundEnabled: audioEnabled });
  const [playFail] = useSound('./error.mp3', { volume: 0.35, soundEnabled: audioEnabled });

  const [mistake, setMistakes] = React.useState(0);

  React.useEffect(() => {
    setValue("");
  }, [resetAllAnswersRequest]);

  // Checks for a complete and accurate cell
  React.useEffect(() => {
    setIsCorrect(value == goal)
    onChange(value == goal)
    playKey();

    if (value == goal) {
      playSuccess();
      fireConfetti()
      fireConfetti()
    }
  }, [goal, value]);

  // Checks every key press
  React.useEffect(() => {
    const hasValue = value.trim().length > 0;
    const whatIsEnteredSoFarMatches = goal.substring(0, value.length) == value;

    if (whatIsEnteredSoFarMatches && hasValue) {
      onCorrectValueEntered();
    }

    setSoFarSoGood(previous => {
      const youJustMadeAMistake = previous && !whatIsEnteredSoFarMatches;
      if (youJustMadeAMistake) {
        setExtraStyle("bg-purple-200 animate-shake-lr");
        playFail();
        setMistakes(mistakes => mistakes + 1);
      } else if (!isCorrect && hasValue) {
        setExtraStyle("bg-purple-200");
      }
      return whatIsEnteredSoFarMatches;
    })

    if (isCorrect) {
      setExtraStyle("bg-blue-600 text-white border-blue-500");
    }

    if (!hasValue || (!isCorrect && focused)) {
      setExtraStyle("");
    }
  }, [value, isCorrect])

  // Need to use this to mutate the context outside of the render cycle.
  React.useEffect(() => {
    mistake > 0 && onWrongValueEntered();
  }, [mistake]);


  if (focused) {
    inputRef?.current?.focus();
  }

  return (
    <td className={`border-2 border-purple-200 ${extraStyle}`}>
      <input ref={inputRef}
        inputMode='decimal'
        className={`w-28 p-2 py-3 text-right bg-transparent border-0 m-0`}
        type="text"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    </td>
  )
}

function TestTable({ goal, onChange }) {
  const totalCells = goal.length * goal[0].length;
  const [percentComplete, setPercentComplete] = React.useState(0);
  const [guesses, setGuesses] = React.useState([...Array(totalCells).fill(false)])

  const handleCellChange = (isCorrect, row, column) => {
    const oneDindex = row * goal.length + column;
    const nextGuessess = [...guesses];

    nextGuessess[oneDindex] = isCorrect
    setGuesses(nextGuessess)

    onChange && onChange(nextGuessess.filter(Boolean).length / totalCells)
  }

  return (
    <div className="rounded-md shadow-md p-4 m-4 bg-white">
      <p className="text-center font-bold uppercase text-lg text-slate-400 mb-4">Your Answers</p>
      <table className="text-gray-500 font-mono">
        <tbody>

          {goal.map((row, rowIndex) => (
            <tr className="" key={rowIndex}>
              {row.map((data, columnIndex) => <CellEntry
                key={columnIndex + data}
                goal={data}
                // focused={rowIndex == 2 && columnIndex == 0}
                onChange={isCorrect => handleCellChange(isCorrect, rowIndex, columnIndex)}
              />)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


function App() {
  const [goal, setGoal] = React.useState(generateTable);
  const [percentComplete, setPercentComplete] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(0);
  const [audioEnabled, setAudioEnabled] = useLocalStorage('audio-enabled', true);

  React.useEffect(() => {
    setIsComplete(percentComplete == 1.0);
  }, [percentComplete, goal]);



  const reset = () => {
    setGoal(generateTable());
  }

  return (
    <AudioContext.Provider value={{ audioEnabled, setAudioEnabled }}>
      <GameControls requestReset={reset} isComplete={isComplete} cellCount={goal.length * goal[0].length}>
        <div className="flex">
          <GoalTable table={goal} />
          <TestTable goal={goal} onChange={setPercentComplete} />
        </div>
      </GameControls>

    </AudioContext.Provider>
  )
}

function StreakCounter({ streak }) {

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (streak > 0) {
        sparkDrip(streak);
      }
    }, 1000 / streak);
    return () => {
      console.log('clearing interval for:', streak)
      clearInterval(interval)
    };
  }, [streak])

  if (streak == 0) {
    return null;
  }

  return (
    <div className="text-slate-300 font-bold flex ml-4 flex-col justify-center animate-excitement absolute top-1 right-8"
      style={{
        animationDuration: `${Math.max(5, 30 - streak) * 0.1}s`,
        fontSize: `${Math.sqrt(Math.max(10, streak) * 2)}rem`,
      }}>
      {streak}
    </div>
  )
}

function Instructions({ onStart }) {
  return (
    <>
      <div className="absolute w-full h-full bg-black opacity-20"></div>
      <div className="absolute w-full h-full backdrop-blur-sm"></div>

      <div className="absolute w-1/2 text-center bg-white rounded-xl p-8 shadow" style={{ maxWidth: "40rem" }}>
        <h1 className="text-4xl font-extrabold">10 Key Queen 👸</h1>
        <p className="mt-4 text-xl">
          You'll be shown a table on the left, <br />
          your job is to replicate it in on the right, <br />
          <span className="text-2xl">...as <strong>fast</strong> as you can.</span>
        </p>
        {/* <button className="bg-slate-600 px-8 py-3 m-2 rounded shadow text-slate-200 text-xl">Let's go!</button> */}
        <button
          onClick={onStart}
          className="mt-4 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
          <span className="text-2xl relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Start
          </span>
        </button>
      </div>
    </>)
}

function Score({ duration, cellCount, onClose, mistakes }) {
  const { audioEnabled } = React.useContext(AudioContext);
  const [playFlawless] = useSound('./flawless.mp3', { volume: 0.35, soundEnabled: audioEnabled });


  if (mistakes == 0) {
    playFlawless();
  }

  return (
    <>
      <div className="absolute w-full h-full bg-white opacity-40"></div>
      <div className="absolute w-full h-full backdrop-blur-sm"></div>

      <div className="absolute w-1/2 text-center bg-white rounded-xl p-8 shadow">
        <h1 className="text-4xl font-extrabold">Yay, Great Job!</h1>
        <p className="mt-4 text-xl">
          It took you {Math.round(duration / 1000)} seconds to fill in {cellCount} cells.
          <br />
          That was {((duration / 1000) / cellCount).toPrecision(3)} seconds per cell.
          <br />
          <span className="text-lg mt-4 inline-block text-slate-400">You made {mistakes} {mistakes == 1 ? 'mistake' : 'mistakes'}.</span>
        </p>
        <button
          onClick={onClose}
          className="mt-4 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
          <span className="text-2xl relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            I want to try again...
          </span>
        </button>
      </div>
    </>)
}

function GameControls({ requestReset, children, isComplete, cellCount }) {
  const [state, setState] = React.useState('ready');
  // const [state, setState] = React.useState('playing');
  const [startTime, setStartTime] = React.useState(null);
  const [endTime, setEndTime] = React.useState(null);

  const { audioEnabled } = React.useContext(AudioContext);
  const [playWin] = useSound('./win.mp3', { volume: 0.5, soundEnabled: audioEnabled });

  const [mistakes, setMistakes] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [resetAllAnswersRequest, setResetAllAnswersRequest] = React.useState(0);

  const onWrongValueEntered = () => {
    setMistakes(mistakes => mistakes + 1);
    setStreak(0);

    if (GAME_MODE.includes('core')) {
      setResetAllAnswersRequest(request => request + 1);
    }
  }

  const onCorrectValueEntered = () => {
    setStreak(streak => streak + 1);
  }

  const startGame = () => {
    setState('playing');
    setStartTime(new Date());
  }

  const reset = () => {
    setState('ready');
    setEndTime(null);
    setMistakes(0);
    setStreak(0);
    requestReset();
  }

  React.useEffect(() => {
    if (state == 'playing' && isComplete) {
      launchFireworks();
      playWin();

      setTimeout(() => { setState('complete') }, 2000);
      setEndTime(end => end ?? new Date());
    }
  }, [isComplete, state])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {state == 'ready' && <Instructions onStart={startGame} />}

      <h1 className="h-14 text-4xl font-extrabold">{state == 'playing' ? '10 Key Queen 👸' : ''}</h1>

      <SteaksContext.Provider value={{ onWrongValueEntered, onCorrectValueEntered, resetAllAnswersRequest }}>
        {state == 'playing' && <StreakCounter streak={streak} />}
        {children}
      </SteaksContext.Provider>

      {state == 'playing' && (<><span className="mt-4 text-slate-400">Queen's tip: Use tab to move between cells.</span><SoundPreference /></>)}

      {state == 'complete' && <Score cellCount={cellCount} mistakes={mistakes} duration={endTime - startTime} onClose={reset} />}
    </div>
  )
}

function SoundPreference() {
  const { audioEnabled, setAudioEnabled } = React.useContext(AudioContext);

  return (
    <button className="text-slate-400 hover:bg-slate-300 p-4 rounded-full"
      onClick={() => { setAudioEnabled(!audioEnabled) }}>
      <span className="flex">
        {audioEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
      </span>
    </button>
  )
}

export default App
