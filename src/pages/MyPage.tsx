import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis/auth';
import { useUserStore } from '../store/useUserStore';
import styles from './MyPage.module.css';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();

  const [isEditingPw, setIsEditingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  // Google users typically don't have a localId in the DB
  const isLocalUser = !!user?.localId;

  const handlePwSave = async () => {
    if (newPw.length < 8) {
      alert('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    try {
      // Using verified keys: currentPassword and newPassword
      await authApi.updatePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      alert('비밀번호가 변경되었습니다.');
      setIsEditingPw(false);
      setCurrentPw('');
      setNewPw('');
    } catch (error: unknown) {
      console.error('Password change error:', error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          '현재 비밀번호가 틀렸거나 오류가 발생했습니다.';
        alert(message);
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.'))
      return;

    try {
      await authApi.deleteAccount();
      clearUser();
      alert('회원 탈퇴가 완료되었습니다.');
      navigate('/');
    } catch (error: unknown) {
      console.error('Delete account error:', error);
      alert('탈퇴 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>마이페이지</h2>

      {/* User Identity Section */}
      <div className={styles.rowCenterNoLine}>
        <span className={styles.usernameText}>
          {user?.localId || user?.oauthId || '사용자'}
        </span>
      </div>

      {/* Conditional Password Section */}
      <div style={{ width: '100%', maxWidth: '350px' }}>
        {isLocalUser ? (
          <>
            <div className={styles.rowSpaceBetween}>
              <span className={styles.sectionLabel}>비밀번호</span>
              {!isEditingPw && (
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setIsEditingPw(true)}
                >
                  변경
                </button>
              )}
            </div>

            {isEditingPw && (
              <div className={styles.pwGroup}>
                <div style={{ display: 'flex' }}>
                  <input
                    type="password"
                    placeholder="현재 비밀번호"
                    className={styles.input}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', marginTop: '10px' }}>
                  <input
                    type="password"
                    placeholder="새 비밀번호"
                    className={styles.input}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handlePwSave}
                  >
                    저장
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.rowCenterNoLine}>
            <p className={styles.socialNotice}>
              소셜 로그인 사용자는 해당 서비스에서 비밀번호를 관리합니다.
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation & Danger Zone */}
      <div className={styles.footerSection}>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={handleDeleteAccount}
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
};

export default MyPage;
