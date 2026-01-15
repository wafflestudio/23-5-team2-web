# 구글 로그인 401 Unauthorized 에러 원인 분석 및 해결 방안

현재 마주하고 계신 문제는 **"쿠키 도메인 불일치 (Cookie Domain Mismatch)"**로 인한 전형적인 CORS 인증 문제입니다.

## 🕵️‍♂️ 원인 분석

1.  **로그인 흐름과 쿠키 생성 위치**
    *   사용자가 구글 로그인을 완료하면 리다이렉트가 발생하며 브라우저는 백엔드 주소(`https://waffle.tteokgook1.net`)로 이동합니다.
    *   백엔드에서 인증이 성공하면 브라우저에게 **세션 쿠키**를 발급합니다.
    *   이때 쿠키의 도메인은 백엔드 주소인 `waffle.tteokgook1.net`으로 설정됩니다.

2.  **프론트엔드로 복귀**
    *   백엔드는 인증 후 사용자를 `localhost:5173`으로 리다이렉트 시킵니다.
    *   사용자는 이제 `localhost` 도메인에 있습니다.

3.  **API 요청 실패 (문제 발생 지점)**
    *   프론트엔드(`App.tsx`의 `fetchUser`)가 `/api/v1/users/me`를 호출합니다.
    *   `vite.config.ts`의 프록시 설정에 의해 이 요청은 `localhost:5173/api/...`로 전송됩니다.
    *   **여기서 문제 발생**: 브라우저는 요청을 보내는 도메인(`localhost`)과 쿠키가 발급된 도메인(`waffle.tteokgook1.net`)이 다르기 때문에, **백엔드에서 발급받은 쿠키를 요청에 실어 보내지 않습니다.**
    *   결국 백엔드는 쿠키가 없는 요청을 받게 되고, `401 Unauthorized`를 응답합니다.

---

## 🛠️ 해결 방안

가장 빠르고 확실한 해결책은 **"프록시를 끄고 백엔드와 직접 통신"**하는 것입니다.

### ✅ 해결 방법 1: API 호출 주소 변경 (권장)

프록시(`localhost`를 거쳐가는 방식)를 사용하지 않고, 쿠키를 가지고 있는 원본 도메인(`waffle.tteokgook1.net`)으로 직접 요청을 보내야 합니다.

**`src/apis/instance.ts` 수정**

```typescript
// src/apis/instance.ts
import axios from 'axios';
import { API_BASE_URL } from '../constants/api'; // 추가

export const api = axios.create({
  // baseURL을 '/api' (프록시) 대신 실제 백엔드 주소로 변경
  baseURL: API_BASE_URL, 
  withCredentials: true, // 필수: 크로스 도메인 요청 시 쿠키 전송 허용
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**⚠️ 주의사항**:
이 방식이 작동하려면 **백엔드 설정**이 다음 조건을 만족해야 합니다.
1.  **CORS 설정**: `AllowedOrigins`에 `https://localhost:5173`이 포함되어 있어야 합니다.
2.  **쿠키 설정**: 발급되는 세션 쿠키가 `SameSite=None; Secure` 속성을 가지고 있어야 합니다. (최신 브라우저는 서로 다른 도메인 간 쿠키 전송 시 이 설정을 강제합니다.)
    *   현재 `mkcert`를 사용 중이시므로 `Secure` 조건은 충족될 가능성이 높습니다.

---

### 💡 (참고) 해결 방법 2: 백엔드 수정 (토큰 방식)

만약 백엔드 개발자와 협업이 가능하다면, 리다이렉트 시 쿠키 대신 URL 쿼리 파라미터로 액세스 토큰을 넘겨주는 방식도 있습니다.
*   예: `http://localhost:5173?token=abcde12345`
*   프론트엔드는 이 토큰을 받아 `localStorage`에 저장하고, 매 요청마다 헤더에 `Authorization: Bearer <token>`을 추가하여 보냅니다.
*   이 방식은 쿠키/도메인 문제에서 자유롭습니다.

### 🚀 요약 및 제안

현재 상황에서 프론트엔드 코드만으로 시도해볼 수 있는 가장 빠른 방법은 **[해결 방법 1]**입니다. `instance.ts`의 `baseURL`을 절대 경로로 변경해 보세요. 만약 그래도 안 된다면 백엔드 개발자에게 CORS 및 SameSite 쿠키 설정을 확인 요청해야 합니다.
