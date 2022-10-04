import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "../Alert/Alert";
import { UserContext } from "../../App";

const UserLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authService } = useContext(UserContext);
  const [userLogins, setUserLogins] = useState({ email: '', password: '' });
  const [error, setError] = useState(false)

  const onChange = ({ target: { name, value } }) => {
    setUserLogins({ ...userLogins, [name]: value, })
  }

  const onLoginUser = (e) => {
    e.preventDefault();
    const { email, password } = userLogins;
    if (!!email && !!password) {
      const from = location.state.prevPath || '/'; 
      authService.loginUser(email, password)
      .then(() => navigate(from))
      .catch(() => {
        setUserLogins({ email: '', password: '' })
        setError(true)
      })
    }
  }
  const errorMsg = 'Sorry, you entered an incorrect email or password';
  return (
    <div className="center-display">
      {error ? <Alert message={errorMsg} type="alert-danger"/> : null}
      <form onSubmit={onLoginUser} className="form">
        <label>Enter your <strong>email address</strong> and <strong>password</strong></label>
        <input 
          onChange={onChange} 
          value={userLogins.email} 
          type="emial" 
          className="form-control" 
          name="email" 
          placeholder="test@mail.com"
        />
        <input 
          onChange={onChange} 
          value={userLogins.password} 
          type="password" 
          className="form-control" 
          name="password" 
          placeholder="password"
        />
        <input type="submit" className="submit-btn" value="Sign In"/>
      </form>
      <div className="footer-text">
        No Account? Create one 
        <Link to="/register" > HERE</Link>
      </div>
    </div>
  )
}

export default UserLogin;