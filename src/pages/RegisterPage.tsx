import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis/auth';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ userId: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.registerLocal(formData);
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('이미 존재하는 아이디거나 양식이 잘못되었습니다.');
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
          gap: '10px',
          maxWidth: '300px',
        }}
      >
        <input
          placeholder="사용할 아이디"
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
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default RegisterPage;
