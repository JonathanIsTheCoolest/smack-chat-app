import React,{useState, createContext, useContext,} from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
import ChatApp from './components/ChatApp/ChatApp';
import UserLogin from './components/UserLogin/UserLogin';
import UserCreate from './components/UserCreate/UserCreate';
import { AuthService, ChatService, SocketService } from './services';

const authService = new AuthService();
const chatService = new ChatService(authService.getBearerHeader);
const socketService = new SocketService(chatService);
export const UserContext = createContext();
const AuthProvider = ({ children }) => {
  const context = {
    authService,
    chatService,
    socketService,
    appSelectedChannel: {},
    appSetChannel: (ch) => {
      setAuthContext({...authContext, appSelectedChannel: ch});
      chatService.setSelectedChannel(ch)
    }
  }

  const [authContext, setAuthContext] = useState(context);

  return (
    <UserContext.Provider value={authContext}>
      {children}
    </UserContext.Provider>
  )
}

const PrivateRoute = () => {
  const location = useLocation();
  const context = useContext(UserContext);
  return (
    context.authService.isLoggedIn ? <Outlet /> : <Navigate to="login" state={ {prevPath: location.pathname} }/>
  )
}

function App() {
  return (

    <AuthProvider>
      <Router >
        <Routes>
          <Route path="login" element={<UserLogin />}/>
          <Route path="register" element={<UserCreate />}/>
          <Route element={<PrivateRoute/>}>
            {/* <Route path="/" element={<ChatApp/>} end/> */}
            <Route path="/" element={<ChatApp/>}/>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;



// React Router V5 Example of a Private Route
// const PrivateRout = ({ children, ...props }) => {
//   const isLoggedIn = false;
//   return (
//     <Route {...props} render={({ location }) => isLoggedIn
//         ? (children)
//         : (<Redirect to={{ pathname: '/login', state: { from: location } }}/>)
//       }
//     />
//   )
// }