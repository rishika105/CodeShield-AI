import { Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'

function App() {

  return (
    <>
      <div className='w-full min-h-screen flex flex-col items-center justify-center'>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>

    </>
  )
}

export default App
