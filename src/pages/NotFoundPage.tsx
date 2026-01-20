import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        color: '#333',
      }}
    >
      <h1
        style={{
          fontSize: '6rem',
          margin: 0,
          color: '#3b82f6',
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: '2rem', marginTop: '1rem', marginBottom: '1rem' }}>
        페이지를 찾을 수 없습니다.
      </h2>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
        요청하신 페이지가 존재하지 않거나, 이름이 변경되었거나,
        <br />
        일시적으로 사용할 수 없습니다.
      </p>
      <Link
        to="/"
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: '600',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFoundPage;
