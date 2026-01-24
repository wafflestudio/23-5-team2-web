import { addEmail, getEmails, removeEmail } from '@/apis/emailApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import styles from './EmailSection.module.css';

const EmailSection = () => {
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // 1. Fetch Emails
  const { data, isLoading, isError } = useQuery({
    queryKey: ['emails'],
    queryFn: getEmails,
  });

  const emailList = Array.isArray(data) ? data : data?.emails || [];

  // 2. Add Email Mutation
  const addMutation = useMutation({
    mutationFn: addEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      setNewEmail('');
      alert('이메일이 추가되었습니다.');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      if (error.response?.status === 409) {
        alert('이미 시스템에 등록된 이메일입니다.');
      } else {
        alert(
          `이메일 추가 실패: ${error.response?.data?.message || '오류가 발생했습니다.'}`
        );
      }
    },
  });

  // 3. Delete Email Mutation
  const deleteMutation = useMutation({
    mutationFn: removeEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      alert('이메일이 삭제되었습니다.');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      alert(
        `이메일 삭제 실패: ${error.response?.data?.message || '오류가 발생했습니다.'}`
      );
    },
  });

  // Validations
  const isValidEmailFormat = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateInput = (email: string) => {
    if (!email) {
      setEmailError('');
      return;
    }

    // Check format
    if (!isValidEmailFormat(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    // Check duplicate
    const isDuplicate = emailList.some((item) => item.email === email);
    if (isDuplicate) {
      setEmailError('이미 등록된 이메일입니다.');
      return;
    }

    setEmailError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewEmail(value);
    validateInput(value.trim()); // Validate trimmed value
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const emailToAdd = newEmail.trim();

    if (!emailToAdd || emailError) return;

    // Double check before submit (though button disabled usually handles this)
    if (!isValidEmailFormat(emailToAdd)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    addMutation.mutate(emailToAdd);
  };

  const handleDelete = (email: string) => {
    if (window.confirm(`${email} 을(를) 삭제하시겠습니까?`)) {
      deleteMutation.mutate(email);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (isError) {
    return <div className={styles.error}>이메일을 불러올 수 없습니다.</div>;
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>알림 이메일 관리</h3>

      <div className={styles.emailList}>
        {emailList.length === 0 ? (
          <div className={styles.emptyMessage}>등록된 이메일이 없습니다.</div>
        ) : (
          emailList.map((item, index) => (
            <div key={`${item.email}-${index}`} className={styles.emailItem}>
              <span className={styles.emailText}>{item.email}</span>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(item.email)}
                disabled={deleteMutation.isPending}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>

      <form className={styles.inputGroup} onSubmit={handleAdd}>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            className={styles.input}
            placeholder="새 이메일 주소 입력"
            value={newEmail}
            onChange={handleInputChange}
          />
          {emailError && (
            <div className={styles.errorMessage}>{emailError}</div>
          )}
        </div>
        <button
          type="submit"
          className={styles.addButton}
          // specific height applied in css to align with input
          disabled={!newEmail.trim() || !!emailError || addMutation.isPending}
        >
          {addMutation.isPending ? '추가 중...' : '추가'}
        </button>
      </form>
    </div>
  );
};

export default EmailSection;
