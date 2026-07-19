import React from'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

// Simulated user roles and permissions
const getUserRole = () => {
  // In a real application, this would be fetched from a secure source
  return localStorage.getItem('userRole') || 'Guest';
};

// Higher-Order Component (HOC) to protect routes based on user roles
const withRole = (role) => (Component) => {
  const WithRole = (props) => {
    const userRole = getUserRole();

    if (userRole!== role) {
      return <Redirect to="/unauthorized" />;
    }

    return <Component {...props} />;
  };

  return WithRole;
};

// Protected routes
const AdminRoute = withRole('Admin')(AdminPage);
const AgentRoute = withRole('Agent')(AgentPage);
const EmployeeRoute = withRole('Employee')(EmployeePage);

// Pages
const AdminPage = () => <h1>Welcome, Admin!</h1>;
const AgentPage = () => <h1>Welcome, Agent!</h1>;
const EmployeePage = () => <h1>Welcome, Employee!</h1>;
const UnauthorizedPage = () => <h1>Unauthorized</h1>;

// App component
const App = () => {
  return (
    <Router>
      <div>
        <Route path="/admin" component={AdminRoute} />
        <Route path="/agent" component={AgentRoute} />
        <Route path="/employee" component={EmployeeRoute} />
        <Route path="/unauthorized" component={UnauthorizedPage} />
        <Route exact path="/" render={() => <h1>Welcome, Guest!</h1>} />
      </div>
    </Router>
  );
};

export default App;