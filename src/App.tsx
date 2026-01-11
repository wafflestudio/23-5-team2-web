import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './style.css';
import { useEffect } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import HealthCheckPage from './pages/HealthCheckPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useUserStore } from './store/useUserStore';

const App = () => {
  // Zustand 스토어에서 fetchUser 함수를 가져옵니다.
  const fetchUser = useUserStore((state) => state.fetchUser);
  const isLoading = useUserStore((state) => state.isLoading);

  useEffect(() => {
    // 앱이 마운트될 때 딱 한 번 실행되어 로그인 상태를 확인합니다.
    fetchUser();
  }, [fetchUser]);

  // 유저 정보를 가져오는 동안 화면 전체가 깜빡이는 것을 방지하기 위해
  // 로딩 중일 때는 아무것도 안 보여주거나 로딩 스피너를 보여줍니다.
  if (isLoading) {
    return <div>로그인 상태 확인 중...</div>;
  }

  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/health" element={<HealthCheckPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
