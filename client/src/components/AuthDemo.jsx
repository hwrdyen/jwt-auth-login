import axios from 'axios';
import { useState, useEffect } from 'react'

function AuthDemo() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const authToken = sessionStorage.getItem('clientAuthToken');
    fetchProfile(authToken)
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    // endpoint is at http://localhost:8080/login
    const username = e.target.username.value;
    const password = e.target.password.value;
    axios.post('http://localhost:8080/login', {
      username: username,
      password: password
    }).then(response => {
      sessionStorage.setItem('clientAuthToken', response.data.token);
      fetchProfile(response.data.token);
    })
    .catch( err => console.log("login error", err.response.data))
  }
  
  const fetchProfile = (token) => {
    axios.get('http://localhost:8080/profile', {
      headers: {
        authorization: `Bearer ${token}`
      }
    }).then(response => {
      setProfileData(response.data);
      setIsLoggedIn(true);
    }).catch(err => console.log('profile error', err.response.data))
  }

  return (
    <div>
      <h1>Auth Client Demo</h1>
      {!isLoggedIn && 
        <form onSubmit={handleSubmit}>
          <h2>Login Form</h2>
          <input name="username" type="text" placeholder="User Name"/>
          <input name="password" type="password" placeholder="Password"/>
          <button>Submit</button>
        </form>
      }
      {isLoggedIn &&
      <>
        <h2>Authorized Page</h2>
        <h3>Welcome, {profileData && profileData.tokenInfo.name}</h3>
        <h3>User Name: {profileData && profileData.tokenInfo.username}</h3>
        <h3>Loves: {profileData && profileData.sensitiveInformation.secret}</h3>
      </>
      }
    </div>
  )
}

export default AuthDemo
