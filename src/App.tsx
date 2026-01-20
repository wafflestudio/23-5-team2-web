// App.tsx
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './style.css';
import { useEffect } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import ArticleDetailPage from './pages/ArticleDetailPage';
import BookmarkPage from './pages/BookmarkPage';
import HomePage from './pages/HomePage';
import Inbox from './pages/Inbox';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import NotFoundPage from './pages/NotFoundPage';
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
          <Route path="/article/:articleId" element={<ArticleDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/bookmark" element={<BookmarkPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
