import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const NavBar = () => {
  return (
    <div>
        <Link to='/'>Home</Link> &nbsp;&nbsp;&nbsp;
        <Link to='/rq-superhero'>RQ Super Heros</Link>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <Outlet/>
    </div>
  )
}

export default NavBar