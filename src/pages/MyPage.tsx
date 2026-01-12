import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis/auth';
import { useUserStore } from '../store/useUserStore';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, fetchUser, clearUser } = useUserStore();

  const [isEditingId, setIsEditingId] = useState(false);
  const [tempId, setTempId] = useState('');
  const [isEditingPw, setIsEditingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  useEffect(() => {
    if (user?.localId) {
      setTempId(String(user.localId));
    } else if (user?.oauthId) {
      setTempId(String(user.oauthId));
    }
  }, [user]);

  const handleIdSave = async () => {
    if (tempId.length < 4) {
      alert('아이디는 4자 이상이어야 합니다.');
      return;
    }
    try {
      await authApi.updateUserId({ userId: tempId });
      await fetchUser();
      setIsEditingId(false);
      alert('아이디가 변경되었습니다.');
    } catch (error) {
      alert('ID 변경에 실패했습니다.');
    }
  };

  const handlePwSave = async () => {
    if (newPw.length < 8) {
      alert('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    try {
      await authApi.updatePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      alert('비밀번호가 변경되었습니다.');
      setIsEditingPw(false);
      setCurrentPw('');
      setNewPw('');
    } catch (error) {
      alert('현재 비밀번호가 틀렸거나 오류가 발생했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      '정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.'
    );
    if (confirmDelete) {
      try {
        // authApi에 deleteAccount가 있다고 가정하거나 직접 경로 입력
        await authApi.deleteAccount();
        clearUser(); // Zustand 상태 초기화
        alert('회원 탈퇴가 완료되었습니다.');
        navigate('/');
      } catch (error) {
        alert('탈퇴 처리 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div style={S.container}>
      <h2 style={S.title}>마이페이지</h2>

      {/* User ID Section */}
      <div style={S.row}>
        {isEditingId ? (
          <>
            <input
              style={S.input}
              value={tempId}
              onChange={(e) => setTempId(e.target.value)}
              autoFocus
            />
            <button style={S.saveButton} onClick={handleIdSave}>
              저장
            </button>
          </>
        ) : (
          <>
            <span style={S.usernameText}>
              {user?.localId || user?.oauthId || '사용자'}
            </span>
            <button style={S.button} onClick={() => setIsEditingId(true)}>
              변경
            </button>
          </>
        )}
      </div>

      {/* Password Section */}
      <div style={{ width: '100%', maxWidth: '350px' }}>
        <div style={S.row}>
          <span style={S.usernameText}>비밀번호</span>
          {!isEditingPw && (
            <button style={S.button} onClick={() => setIsEditingPw(true)}>
              변경
            </button>
          )}
        </div>

        {isEditingPw && (
          <div style={S.pwGroup}>
            <div style={{ display: 'flex' }}>
              <input
                type="password"
                placeholder="현재 비밀번호"
                style={S.input}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', marginTop: '10px' }}>
              <input
                type="password"
                placeholder="새 비밀번호"
                style={S.input}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <button style={S.saveButton} onClick={handlePwSave}>
                저장
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation and Delete Section */}
      <div style={S.footerSection}>
        <button style={S.backLink} onClick={() => navigate('/')}>
          홈으로 돌아가기
        </button>

        <button style={S.deleteButton} onClick={handleDeleteAccount}>
          회원 탈퇴
        </button>
      </div>
    </div>
  );
};

const S = {
  container: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,
  title: {
    marginBottom: '3rem',
    fontSize: '32px',
    fontWeight: 'normal',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: '350px',
    margin: '15px 0',
    minHeight: '45px',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '10px',
  } as React.CSSProperties,
  usernameText: {
    fontSize: '20px',
    color: '#333',
    flex: 1,
    textAlign: 'left' as const,
  } as React.CSSProperties,
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    flex: 1,
    marginRight: '10px',
    fontSize: '14px',
  } as React.CSSProperties,
  button: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '1px solid #999',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginLeft: '20px',
  } as React.CSSProperties,
  saveButton: {
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    border: '1px solid #000',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
  pwGroup: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: '10px',
  } as React.CSSProperties,
  footerSection: {
    marginTop: '5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#888',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#ff4d4f', // Standard "Danger" Red
    cursor: 'pointer',
    fontSize: '13px',
    opacity: 0.8,
  } as React.CSSProperties,
};

export default MyPage;
