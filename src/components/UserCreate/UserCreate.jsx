import React,{ useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import { AVATARS_DARK, AVATARS_LIGHT } from "../../constants";
import Alert from "../Alert/Alert";
import Modal from "../Modal/Modal";
import UserAvatar from "../UserAvatar/UserAvatar";
import './UserCreate.css';

const UserCreate = () => {
  const { authService } = useContext(UserContext);
  const navigate = useNavigate();
  const INIT_STATE = {
    userName: '',
    email: '',
    password: '',
    avatarName: '/smack_chat_assets/avatarDefault.png',
    avatarColor: 'none',
  }

  const [ userInfo, setUserInfo ] = useState(INIT_STATE)
  const [ modal, setModal ] = useState(false);
  const [ error, setError ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ isLightAvatar, setIsLightAvatar ] = useState(false);

  const onChange = ({ target: { name, value }}) => {
    setUserInfo({...userInfo, [name]: value});
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
      <div className="center-display">
        {error ? <Alert message={errorMsg} type="alert-danger"/> : null}
        {isLoading ? <div>Loading...</div> : null}
        <h3 className="title">Create an account</h3>
        <form onSubmit={createUser} className="form">
          <input
            onChange={onChange}
            value={userName} 
            type="text" 
            className="form-control" 
            name="userName" 
            placeholder="enter username"
          />
          <input
            onChange={onChange}
            value={email} 
            type="email" 
            className="form-control" 
            name="email" 
            placeholder="enter email"/>
          <input
            onChange={onChange}
            value={password} 
            type="password" 
            className="form-control" 
            name="password" 
            placeholder="enter password"
          />
          <div className="avatar-container">
            <UserAvatar avatar={{ avatarName, avatarColor }} className="create-avatar" />
            <div onClick={() => setModal(true)} className="avatar-text">Choose avatar</div>
            <div onClick={generateBgColor} className="avatar-text">Generate background color</div>
          </div>
          <input className="submit-btn" type="submit" value="Create Account" />
        </form>
        <div className="footer-text">Already have an Account? Login <Link to="/login" state={{prevPath: '/'}}>HERE</Link></div>
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
    </>
  );
}

export default UserCreate;











































// import React,{ useState, useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { UserContext } from "../../App";
// import { AVATARS } from "../../constants";
// import Alert from "../Alert/Alert";
// import Modal from "../Modal/Modal";
// import './UserCreate.css';

// const UserCreate = () => {
//   const { authService } = useContext(UserContext);
//   const navigate = useNavigate();
//   const INIT_STATE = {
//     userName: '',
//     email: '',
//     password: '',
//     avatarName: '/smack_chat_assets/avatarDefault.png',
//     avatarColor: 'none',
//   }

//   const [ userInfo, setUserInfo ] = useState(INIT_STATE)
//   const [ modal, setModal ] = useState(false);
//   const [error, setError] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const onChange = ({ target: { name, value }}) => {
//     setUserInfo({...userInfo, [name]: value});
//   }

//   const chooseAvatar = (avatar) => () => {
//     setUserInfo({...userInfo, avatarName: avatar});
//     setModal(false);
//   }

//   const generateBgColor = () => {
//     const randomColor = Math.floor(Math.random() * 16777215).toString(16);
//     setUserInfo({...userInfo, avatarColor: `#${randomColor}`});
//   }

//   const createUser = (e) => {
//     e.preventDefault();
//     const { userName, email, password, avatarName, avatarColor } = userInfo;
//     if (!!userName && !!email && !!password) {
//       setIsLoading(true)
//       authService.registerUser(email, password).then(() => {
//         authService.loginUser(email, password).then(() => {
//           authService.createUser(userName, email, avatarName, avatarColor).then(() => {
//             setUserInfo(INIT_STATE);
//             navigate('/');
//           }).catch((error) => {
//             console.error('creating user',error.response.data)
//             setError(true);
//           })
//         }).catch((error) => {
//           console.error('logging in user',error.response.data)
//           setError(true);
//         })
//       }).catch((error) => {
//         console.error('registering user',error.response.data)
//         setError(true);
//       })
//       setIsLoading(false);
//     }
//   }

//   const { userName, email, password, avatarName, avatarColor } = userInfo;
//   const errorMsg = 'Error creating account. Please try again.'
//   return (
//     <>
//       <div className="center-display">
//         {error ? <Alert message={errorMsg} type="alert-danger"/> : null}
//         {isLoading ? <div>Loading...</div> : null}
//         <h3 className="title">Create an account</h3>
//         <form onSubmit={createUser} className="form">
//           <input
//             onChange={onChange}
//             value={userName} 
//             type="text" 
//             className="form-control" 
//             name="userName" 
//             placeholder="enter username"
//           />
//           <input
//             onChange={onChange}
//             value={email} 
//             type="email" 
//             className="form-control" 
//             name="email" 
//             placeholder="enter email"/>
//           <input
//             onChange={onChange}
//             value={password} 
//             type="password" 
//             className="form-control" 
//             name="password" 
//             placeholder="enter password"
//           />
//           <div className="avatar-container">
//             <img style={{ backgroundColor: avatarColor }} className="avatar-icon avatar-b-radius" src={avatarName} alt="avatar"/>
//             <div onClick={() => setModal(true)} className="avatar-text">Choose avatar</div>
//             <div onClick={generateBgColor} className="avatar-text">Generate background color</div>
//           </div>
//           <input className="submit-btn" type="submit" value="Create Account" />
//         </form>
//         <div className="footer-text">Already have an Account? Login <Link to="/login">HERE</Link></div>
//       </div>
//       <Modal title="Choose Avatar" isOpen={modal} close={() => setModal(false)}>
//         <div className="avatar-list">
//           {AVATARS.map((img) => (
//             <div role="presentation" key={img} className="avatar-icon" onClick={chooseAvatar(img)}>
//               <img src={img} alt="avatar" />
//             </div>
//           ))}
//         </div>
//       </Modal>
//     </>
//   );
// }

// export default UserCreate;