import { authApi } from '@/apis/authApi';
import styles from '@/components/auth/AuthForm.module.css';
import AuthLayout from '@/components/auth/AuthLayout';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import PasswordInput from '@/components/auth/PasswordInput';
import type { AuthRequest } from '@/types/auth';
// pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterForm extends AuthRequest {
  passwordConfirm: string;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    userId: '',
    password: '',
    passwordConfirm: '',
  });
  const navigate = useNavigate();

  const isUserIdValid = formData.userId.length >= 4;
  const isPasswordValid = formData.password.length >= 8;
  const isPasswordMatch =
    formData.password === formData.passwordConfirm && formData.password !== '';

  const isFormValid = isUserIdValid && isPasswordValid && isPasswordMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert('입력 양식을 다시 확인해주세요.');
      return;
    }

    const { passwordConfirm, ...registerFormData } = formData;

    try {
      await authApi.registerLocal(registerFormData);
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('이미 존재하는 아이디이거나 서버 오류가 발생했습니다.');
    }
  };

  return (
    <AuthLayout title="회원가입">
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 아이디 입력 */}
        <div>
          <input
            placeholder="아이디"
            value={formData.userId}
            onChange={(e) =>
              setFormData({ ...formData, userId: e.target.value })
            }
            className={styles.input}
            required
          />
          {formData.userId && !isUserIdValid && (
            <p className={styles.errorMessage}>
              아이디는 4자 이상이어야 합니다.
            </p>
          )}
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <PasswordInput
            placeholder="비밀번호"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={styles.input}
            required
          />
          {formData.password && !isPasswordValid && (
            <p className={styles.errorMessage}>
              비밀번호는 8자 이상이어야 합니다.
            </p>
          )}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div>
          <PasswordInput
            placeholder="비밀번호 확인"
            value={formData.passwordConfirm}
            onChange={(e) =>
              setFormData({ ...formData, passwordConfirm: e.target.value })
            }
            className={styles.input}
            required
          />
          {formData.passwordConfirm && (
            <p
              className={
                isPasswordMatch ? styles.successMessage : styles.errorMessage
              }
            >
              {isPasswordMatch
                ? '비밀번호가 일치합니다.'
                : '비밀번호가 일치하지 않습니다.'}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={styles.submitButton}
        >
          회원가입
        </button>
      </form>

      {/* 구분선 추가 */}
      <div className={styles.divider}>
        <span className={styles.dividerText}>또는</span>
      </div>

      {/* 구글 로그인/회원가입 버튼 추가 */}
      <div className={styles.socialLoginWrapper}>
        <GoogleLoginButton
          text="Google 계정으로 회원가입"
          className={styles.googleButton}
        />
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
