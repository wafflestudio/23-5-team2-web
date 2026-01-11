// pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis/auth';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { useUserStore } from '../store/useUserStore';
import type { AuthRequest } from '../types/auth';

const LoginPage = () => {
  const [formData, setFormData] = useState<AuthRequest>({
    userId: '',
    password: '',
  });
  const navigate = useNavigate();
  const { fetchUser } = useUserStore(); // Zustand의 fetchUser 함수를 가져옵니다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.loginLocal(formData);
      // 로그인 성공 직후 Zustand의 fetchUser를 호출하여 전역 상태를 업데이트합니다.
      await fetchUser();
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('로그인에 실패했습니다. 아이디나 비밀번호를 확인하세요.');
    }
  };

  return (
    <div
      style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2>로그인</h2>

      {/* 1. 로컬 로그인 폼 */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '300px',
        }}
      >
        <input
          placeholder="아이디"
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
          로그인
        </button>
      </form>

      {/* 구분선 */}
      <div
        style={{
          margin: '1.5rem 0',
          width: '100%',
          maxWidth: '300px',
          textAlign: 'center',
          borderBottom: '1px solid #ccc',
          lineHeight: '0.1em',
        }}
      >
        <span
          style={{
            background: '#fff',
            padding: '0 10px',
            color: '#888',
            fontSize: '14px',
          }}
        >
          또는
        </span>
      </div>

      {/* 2. 소셜 로그인 영역 (폼 외부) */}
      <div style={{ width: '100%', maxWidth: '300px' }}>
        <GoogleLoginButton text="구글로 로그인" />
      </div>
    </div>
  );
};

export default LoginPage;
