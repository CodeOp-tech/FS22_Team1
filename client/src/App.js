import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import ErrorView from './views/ErrorView';
import ProfileView from './views/ProfileView';



import Local from './helpers/Local';
import Api from './helpers/Api';

import LoginView from './views/LoginView';


function App() {
  const [user, setUser] = useState(Local.getUser());
  const [loginErrorMsg, setLoginErrorMsg] = useState('');
  const navigate = useNavigate();

  async function doLogin(username, password) {
    let myresponse = await Api.loginUser(username, password);
    if (myresponse.ok) {
        Local.saveUserInfo(myresponse.data.token, myresponse.data.user);
        setUser(myresponse.data.user);
        setLoginErrorMsg('');
        navigate('/');
    } else {
        setLoginErrorMsg('Login failed');
    }
}

  function doLogout() {
    Local.removeUserInfo();
    setUser(null);
  }

  return (
    <div className="App">

      <NavBar/>


      <Routes>
      <Route path="/" element={<h1>Home</h1>} />

        <Route path="/login" element={
          <LoginView 
            loginCb={(u, p) => doLogin(u, p)} 
            loginError={loginErrorMsg} 
            />
         } />
         <Route path="/users/:userId" element={
            <PrivateRoute>
                <ProfileView />
            </PrivateRoute>
        } />          
                    <Route path="*" element={<ErrorView code="404" text="Page not found" />} />
      </Routes>
    </div>
  );
}

export default App;
