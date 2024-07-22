// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Menu from './components/Menu';
import Order from './components/Order';
import Admin from './components/Admin';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/menu" component={Menu} />
        <Route path="/order" component={Order} />
        <Route path="/admin" component={Admin} />
        <Route path="/" exact component={Menu} />
        <Route path="*" component={Menu} />
      </Switch>
    </Router>
  );
}

export default App;
