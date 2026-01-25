// components/GoogleLoginButton.tsx
import { BACKEND_URL } from '@/constants/api';

interface Props {
  text?: string;
  className?: string;
}

const GoogleLoginButton = ({
  text = '구글 로그인 / 회원가입',
  className,
}: Props) => {
  const handleGoogleLogin = () => {
    // 1. 로그인이 끝나고 돌아올 프론트엔드 주소 (보통 메인 페이지)
    const frontendRedirectUri = window.location.origin;

    // 2. 특수문자가 포함될 수 있으므로 반드시 인코딩해야 합니다.
    const encodedUri = encodeURIComponent(frontendRedirectUri);

    // 3. 최종 URL 생성: 백엔드가 요구하는 쿼리 키(예: redirect_uri)를 확인하세요.
    // 백엔드 개발자에게 키 이름이 'redirect_uri'인지 'state'인지 확인이 필요합니다.
    const googleLoginUrl = `${BACKEND_URL}/oauth2/authorization/google?redirect_uri=${encodedUri}`;

    // 4. 페이지 이동
    window.location.href = googleLoginUrl;
  };

  return (
    <button onClick={handleGoogleLogin} className={className}>
      {text}
    </button>
  );
};

export default GoogleLoginButton;
