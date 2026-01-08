import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './style.css';
import Footer from './components/Footer';
import Header from './components/Header';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
