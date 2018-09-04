import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// export default class App extends React.Component {
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // todos: ['hi', 'boo']
      todos: null
    }
  }

  render() {
    const { todos } = this.state;
    return (
      <Router>
        <div>
          <Route exact={true} path="/" render={() => (
            <div>
              <h1>Welcome</h1>
            </div>
          )}/>
          {todos ? ( 
            todos.map(todo => (
              <div>{todo}</div> 
            ))
          ) : (
            <div>Loading...</div>
          )}
          <Route path="/login" Component={Login}/>
        </div>
      </Router>
    );
  }

  // 

}

const Login = () => (
  <div>
    <a href="/auth/google">Login with Google</a>
  </div>
);

export default App;