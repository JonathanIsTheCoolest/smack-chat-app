import React,{ useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import { AVATARS_DARK, AVATARS_LIGHT } from "../../constants";
import Alert from "../Alert/Alert";
import Modal from "../Modal/Modal";
import UserAvatar from "../UserAvatar/UserAvatar";
import './UserCreate.css';

const UserCreate = ({ setParentModal, setIsEditUser, logout }) => {
  const { authService } = useContext(UserContext);
  const { avatarColor: aColor, avatarName: aName, email: uEmail, name: uName, authToken: token, id  } = authService;

  const AVATAR_NAME = aName || '/smack_chat_assets/avatarDefault.png';
  const AVATAR_COLOR = aColor || 'none';

  const navigate = useNavigate();
  const INIT_STATE = {
    userName: '',
    email: '',
    password: '',
    avatarName: AVATAR_NAME,
    avatarColor: AVATAR_COLOR,
  }
  const INIT_STATE_USER_CONFIRM_INFO = {
    email: '',
    password: '',
  }

  const [ userInfo, setUserInfo ] = useState(INIT_STATE);
  const [ userConfirmInfo , setUserConfirmInfo ] = useState(INIT_STATE_USER_CONFIRM_INFO);
  const [ modal, setModal ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ isLightAvatar, setIsLightAvatar ] = useState(false);
  const [ confirmModal, setConfirmModal ] = useState(false);

  const USER_NAME = userInfo.userName || uName;
  const USER_EMAIL = userInfo.email || uEmail;
  const USER_AVATAR_NAME = userInfo.avatarName || aName;
  const USER_AVATAR_COLOR = userInfo.avatarColor || aColor;

  const onChange = ({ target: { name, value }}) => {
    setUserInfo({...userInfo, [name]: value});
  }

  const onChangeEditInfo = ({ target: { name, value }}) => {
    setUserConfirmInfo({...userConfirmInfo, [name]: value});
  }

  const onClickCloseConfirmModal = () => {
    setConfirmModal(false);
    setUserConfirmInfo(INIT_STATE_USER_CONFIRM_INFO);
  }

  const chooseAvatar = (avatar) => () => {
    setUserInfo({...userInfo, avatarName: avatar});
    setModal(false);
  }

  const generateBgColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    setUserInfo({...userInfo, avatarColor: `#${randomColor}`});
  }

  const createUser = (e) => {
    e.preventDefault();
    const { userName, email, password, avatarName, avatarColor } = userInfo;
    if (!!userName && !!email && !!password) {
      setIsLoading(true)
      authService.registerUser(email, password).then(() => {
        authService.loginUser(email, password).then(() => {
          authService.createUser(userName, email, avatarName, avatarColor).then(() => {
            setUserInfo(INIT_STATE);
            navigate('/');
          }).catch((error) => {
            console.error('creating user',error.response.data)
            setError(true);
          })
        }).catch((error) => {
          console.error('logging in user',error.response.data)
          setError(true);
        })
      }).catch((error) => {
        console.error('registering user',error.response.data)
        setError(true);
      })
      setIsLoading(false);
    }
  }

  const updateUser = (e) => {
    e.preventDefault();
    const { email: userEmail } = authService;
    const { password, email: enteredEmail } = userConfirmInfo;
    const userObject = {
      name: USER_NAME,
      email: USER_EMAIL,
      avatarName: USER_AVATAR_NAME,
      avatarColor: USER_AVATAR_COLOR,
    };
    const accountObject = { username: USER_EMAIL };
    if (!!userEmail && !!password && userEmail === enteredEmail) {
      authService.authenticateUser(enteredEmail, password).then(() => {
        authService.updateUser(userObject).then(() => {
          authService.updateAccount(accountObject).then(() => {
            authService.setUserData({_id: id, ...userObject});
            setParentModal(false);
            setIsEditUser(false);
            setConfirmModal(false);
            setUserConfirmInfo(INIT_STATE_USER_CONFIRM_INFO);
          }).catch((error) => {
            console.error('authenticating user', error.response.data);
          })
        }).catch((error) => {
          console.error('updating user', error.response.data);
        })
      }).catch((error) => {
        console.error('updating account', error.response.data);
      })
    }
  }

  const openConfirmEditModule = (e) => {
    const { userName, email, avatarName, avatarColor } = userInfo;
    e.preventDefault();
    if (userName.length || email.length || avatarName !== AVATAR_NAME || avatarColor !== AVATAR_COLOR ) {
      console.log('Hello World');
      setConfirmModal(true);
    }
  }

  const avatarArrayFunciton = (avatarArray) => {
    return avatarArray.map((img) => (
      <div role="presentation" key={img} className="create-avatar" onClick={chooseAvatar(img)}>
        <img src={img} alt="avatar" />
      </div>
    ))
  }

  const { userName, email, password, avatarName, avatarColor } = userInfo;
  const errorMsg = 'Error creating account. Please try again.'
  return (
    <>
      <div className={ token ? 'center-display-as-modal' : 'center-display' }>
        {error ? <Alert message={errorMsg} type="alert-danger"/> : null}
        {isLoading ? <div>Loading...</div> : null}
        {
          !!token ?
          null :
          <h3 className="title">Create an account</h3>
        }
        <form onSubmit={token ? openConfirmEditModule : createUser} className={token ? "modal-form" : "form"}>
          <input
            onChange={onChange}
            value={userName} 
            type="text" 
            className="form-control" 
            name="userName" 
            placeholder={token ? 'enter new username' : 'enter username'}
          />
          <input
            onChange={onChange}
            value={email} 
            type="email" 
            className="form-control" 
            name="email" 
            placeholder={token ? 'enter new email' : 'enter email'}
          />
          {
            !token ?
            <input
              onChange={onChange}
              value={password} 
              type="password" 
              className="form-control" 
              name="password" 
              placeholder={token ? 'enter new password' : 'enter password'}
            />:
            null
          }
          <div className="avatar-container">
            <UserAvatar avatar={{ avatarName, avatarColor }} className="create-avatar" />
            <div onClick={() => setModal(true)} className="avatar-text">Choose avatar</div>
            <div onClick={generateBgColor} className="avatar-text">Generate background color</div>
          </div>
          {
            token ?
            <input className="submit-btn" type="submit" value="Edit Account" /> :
            <input className="submit-btn" type="submit" value="Create Account" />
          }
        </form>
        { token ? null : <div className="footer-text">Already have an Account? Login <Link to="/login" state={{prevPath: '/'}}>HERE</Link></div> }
      </div>
      <Modal title="Choose Avatar" isOpen={modal} close={() => setModal(false)} isLightAvatar={isLightAvatar}>
        <div className="modal-radio-wrapper">
          <label className={!isLightAvatar ? "radio-buttons radio-buttons-selected": "radio-buttons"} onClick={() => setIsLightAvatar(false)} htmlFor="dark"> Dark
            <input defaultChecked={!isLightAvatar ? true : false} type="radio" name="avatar-toggle" id="dark" value="Dark"/>
          </label>
          <label className={isLightAvatar ? "radio-buttons radio-buttons-selected": "radio-buttons"} onClick={() => setIsLightAvatar(true)} htmlFor="light"> Light
            <input defaultChecked={isLightAvatar ? true : false} type="radio" name="avatar-toggle" id="light" value="Light"/>
          </label>
        </div>
        <div className="avatar-list">
          {
            isLightAvatar ?
            avatarArrayFunciton(AVATARS_LIGHT) :
            avatarArrayFunciton(AVATARS_DARK)
          }
        </div>
      </Modal>
      <Modal title="User Confirmation" isOpen={confirmModal} close={onClickCloseConfirmModal}>
        <form onSubmit={updateUser}>
          <input
            onChange={onChangeEditInfo}
            value={userConfirmInfo.email} 
            type="email" 
            className="form-control confirm-inputs" 
            name="email" 
            placeholder="enter current email"
          />
          <input
            onChange={onChangeEditInfo}
            value={userConfirmInfo.password} 
            type="password" 
            className="form-control confirm-inputs" 
            name="password" 
            placeholder="enter current password"
          /> 
          <input className="submit-btn" type="submit" value="Confirm Edit" />
        </form>
      </Modal>
    </>
  );
}

export default UserCreate;