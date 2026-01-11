import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../constants/api';
// import { useUserStore } from '../store/useUserStore';

const Header = () => {
  // console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
  // console.log('전체 환경변수:', import.meta.env);

  // const { user, clearUser } = useUserStore(); // TODO: 유저 상태 관리 로직 추가

  const handleGoogleLogin = () => {
    const loginUrl = API_ENDPOINTS.AUTH.GOOGLE_LOGIN;
    // console.log('이동할 주소:', loginUrl); // 여기서 어떻게 나오는지 확인이 필요합니다!
    // 만약 undefined/oauth2/... 라고 나온다면 변수 설정 문제임

    window.location.href = loginUrl;
  };

  return (
    <header>
      <div>스누보드</div>
      <Link to="/login">로그인</Link>
      <Link to="/register">회원가입</Link>
      <button onClick={handleGoogleLogin}>구글 로그인 / 회원가입</button>
    </header>
  );
};

export default Header;
