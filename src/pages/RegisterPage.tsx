import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis/auth';
import type { AuthRequest } from '../types/auth';

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
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('이미 존재하는 아이디이거나 서버 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>회원가입</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          maxWidth: '300px',
        }}
      >
        {/* 아이디 입력 */}
        <div>
          <input
            placeholder="아이디"
            value={formData.userId}
            onChange={(e) =>
              setFormData({ ...formData, userId: e.target.value })
            }
            style={{ width: '100%', padding: '8px' }}
            required
          />
          {formData.userId && !isUserIdValid && (
            <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>
              아이디는 4자 이상이어야 합니다.
            </p>
          )}
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <input
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            style={{ width: '100%', padding: '8px' }}
            required
          />
          {formData.password && !isPasswordValid && (
            <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>
              비밀번호는 8자 이상이어야 합니다.
            </p>
          )}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div>
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={formData.passwordConfirm}
            onChange={(e) =>
              setFormData({ ...formData, passwordConfirm: e.target.value })
            }
            style={{ width: '100%', padding: '8px' }}
            required
          />
          {formData.passwordConfirm && (
            <p
              style={{
                color: isPasswordMatch ? 'green' : 'red',
                fontSize: '12px',
                margin: '4px 0',
              }}
            >
              {isPasswordMatch
                ? '비밀번호가 일치합니다.'
                : '비밀번호가 일치하지 않습니다.'}
            </p>
          )}
        </div>

        {/* 2. 모든 조건이 맞지 않으면 버튼 비활성화(disabled) */}
        <button
          type="submit"
          disabled={!isFormValid}
          style={{
            padding: '10px',
            backgroundColor: isFormValid ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            cursor: isFormValid ? 'pointer' : 'not-allowed',
          }}
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
