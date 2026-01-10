import { Link } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

const Header = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
  };

  return (
    <header>
      <div>스누보드</div>
      <Link to="/login">로그인</Link>
      <Link to="/register">회원가입</Link>
      <button onClick={handleGoogleLogin}>구글 로그인</button>
    </header>
  );
};

export default Header;
