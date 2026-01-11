import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis/auth';
import type { AuthRequest } from '../types/auth';

const LoginPage = () => {
  const [formData, setFormData] = useState<AuthRequest>({
    userId: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authApi.loginLocal(formData);
      alert('로그인 성공!');
      navigate('/'); // 메인 페이지로 이동
    } catch (error) {
      console.error(error);
      alert('로그인에 실패했습니다. 아이디나 비밀번호를 확인하세요.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>로그인</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
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
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default LoginPage;
