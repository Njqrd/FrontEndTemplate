import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MessageCard from './Jefferey'
import SodefiFundComponent from './SodefiFundComponent';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <MessageCard/> */}
      <SodefiFundComponent />
    </>
  )
}

export default App
