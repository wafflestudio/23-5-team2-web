import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../constants/api';
// import { useUserStore } from '../store/useUserStore';

const Header = () => {
  // console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
  // console.log('전체 환경변수:', import.meta.env);

  // const { user, clearUser } = useUserStore(); // TODO: 유저 상태 관리 로직 추가

  const handleGoogleLogin = () => {
    // 1. 로그인이 끝나고 돌아올 프론트엔드 주소 (보통 메인 페이지)
    const frontendRedirectUri = 'http://localhost:5173/'; // 혹은 배포된 도메인
    
    // 2. 특수문자가 포함될 수 있으므로 반드시 인코딩해야 합니다.
    const encodedUri = encodeURIComponent(frontendRedirectUri);

    // 3. 최종 URL 생성: 백엔드가 요구하는 쿼리 키(예: redirect_uri)를 확인하세요.
    // 백엔드 개발자에게 키 이름이 'redirect_uri'인지 'state'인지 확인이 필요합니다.
    const googleLoginUrl = `${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}?redirect_uri=${encodedUri}`;

    alert(googleLoginUrl);

    // 4. 페이지 이동
    window.location.href = googleLoginUrl;
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
