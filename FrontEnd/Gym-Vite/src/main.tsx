// main.tsx
import * as React from 'react';
// import * as ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './pages/LoginPage.tsx';
import RegistrationPage from './pages/RegistrationPage.tsx';
import ChatRoom from "./pages/ChatRoom.tsx";
// import ProfilePage from "./pages/ProfilePage.tsx";
// import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
// import TimeAvailability from './pages/TimeAvailability.tsx';
// import TimetableContainer from './pages/TimetableContainer.tsx';
// import NextWeekAvailability from "./pages/NextWeekAvailability.tsx";
// import TimetableNextWeek from "./pages/TimetableNextWeek.tsx";
import {StrictMode} from "react";
import SchedulePage from "./pages/SchedulePage.tsx";
import {Route} from "react-router-dom";


export default () => (
  <StrictMode>
    <main>
        <Route path="/">
          <SchedulePage />
        </Route>
        <Route path="/chat">
          <ChatRoom />
        </Route>
        <Route path="/login">
          <LoginPage />
        </Route>
        <Route path="/register">
          <RegistrationPage />
        </Route>
    </main>
  </StrictMode>
);
// ReactDOM.createRoot(document.getElementById('root')!).render(
//     <React.StrictMode>
//         <Router>
//             <Routes>
//                 {/*<main>*/}
//                 {/*    <Route path="/reg">*/}
//                 {/*        <RegistrationPage/>*/}
//                 {/*    </Route>*/}
//                     <Route path="/register" element={<RegistrationPage/>}/>
//                     <Route path="/availability" element={<TimeAvailability/>}/>
//                     <Route path="/availability/nextweek" element={<NextWeekAvailability/>}/>
//                     <Route path="/register" element={<RegistrationPage/>}/>
//                     <Route path="/" element={<TimetableContainer/>}/>
//                     <Route path="/chat" element={<ChatRoom/>}/>
//                     <Route path="/profile" element={<ProfilePage/>}/>
//                     <Route path="/login" element={<LoginPage/>}/>
//                     <Route path="/next" element={<TimetableNextWeek/>}/>
//                 {/*</main>*/}
//             </Routes>
//         </Router>
//     </React.StrictMode>,
//     // document.getElementById('root')
// );
