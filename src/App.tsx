// App.tsx
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './style.css';
import { useEffect } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import HealthCheckPage from './pages/HealthCheckPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import RegisterPage from './pages/RegisterPage';
import { useUserStore } from './store/useUserStore';

const App = () => {
  // Zustand 스토어에서 fetchUser 함수를 가져옵니다.
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    // 앱이 마운트될 때 딱 한 번 실행되어 로그인 상태를 확인합니다.
    fetchUser();
  }, [fetchUser]);

  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/health" element={<HealthCheckPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
