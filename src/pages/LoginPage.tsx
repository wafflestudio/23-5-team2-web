import { authApi } from '@/apis/authApi';
import styles from '@/components/auth/AuthForm.module.css';
import AuthLayout from '@/components/auth/AuthLayout';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import PasswordInput from '@/components/auth/PasswordInput';
import { useUserStore } from '@/store/useUserStore';
import type { AuthRequest } from '@/types/auth';
// pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <AuthLayout title="로그인">
      {/* 1. 로컬 로그인 폼 */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          placeholder="아이디"
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          className={styles.input}
          required
        />
        <PasswordInput
          placeholder="비밀번호"
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className={styles.input}
          required
        />
        <button type="submit" className={styles.submitButton}>
          로그인
        </button>
      </form>

      {/* 구분선 */}
      <div className={styles.divider}>
        <span className={styles.dividerText}>또는</span>
      </div>

      {/* 2. 소셜 로그인 영역 */}
      <div className={styles.socialLoginWrapper}>
        <GoogleLoginButton
          text="Google 계정으로 로그인"
          className={styles.googleButton}
        />
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
