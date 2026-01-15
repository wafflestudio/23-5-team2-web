import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis/authApi'; // Note: check import path, original was '../apis/auth' but LoginPage uses '../apis/authApi'. I saw LoginPage.tsx using authApi.
import authStyles from '../components/auth/AuthForm.module.css';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordInput from '../components/auth/PasswordInput';
import { useUserStore } from '../store/useUserStore';
import styles from './MyPage.module.css';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();

  const [isEditingPw, setIsEditingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  // removed local showPassword state

  // Google users typically don't have a localId in the DB (or handled differently)
  // Assuming logic from original file: check if localId exists
  const isLocalUser = !!user?.localId;

  const handlePwSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (newPw.length < 8) {
      alert('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (currentPw === newPw && newPw !== '') {
      console.error('현재 비밀번호와 새 비밀번호가 동일합니다.');
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
    <AuthLayout title="마이페이지">
      {/* User Info */}
      <div className={styles.infoRow}>
        <span className={styles.label}>아이디</span>
        <span className={styles.value}>
          {user?.localId || user?.oauthId || '사용자'}
        </span>
      </div>

      {/* Password Section */}
      <div className={styles.section}>
        {isLocalUser ? (
          <>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>비밀번호</span>
              {!isEditingPw && (
                <button
                  type="button"
                  className={styles.toggleButton}
                  onClick={() => setIsEditingPw(true)}
                >
                  변경하기
                </button>
              )}
            </div>

            {isEditingPw && (
              <form className={styles.formGroup} onSubmit={handlePwSave}>
                <PasswordInput
                  placeholder="현재 비밀번호"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className={authStyles.input}
                />

                <PasswordInput
                  placeholder="새 비밀번호 (8자 이상)"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className={authStyles.input}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setIsEditingPw(false);
                      setCurrentPw('');
                      setNewPw('');
                    }}
                  >
                    취소
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    확인
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <p className={styles.notice}>
            소셜 로그인 사용자는 해당 서비스에서 비밀번호를 관리합니다.
          </p>
        )}
      </div>

      {/* Delete Account */}
      <button
        type="button"
        className={styles.deleteButton}
        onClick={handleDeleteAccount}
      >
        회원 탈퇴
      </button>
    </AuthLayout>
  );
};

export default MyPage;
