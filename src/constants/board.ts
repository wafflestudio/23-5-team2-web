// 1. Slug (크롤러) -> 한국어 변환 딕셔너리
export const SLUG_TO_KO: Record<string, string> = {
  service: '서비스 공지',
  mysnu: '마이스누',
  cse: '컴퓨터공학부',
  career: '경력개발센터',
  snuti: '첨단융합학부',
};

// 2. English Name (보드 API) -> 한국어 변환 딕셔너리
export const EN_TO_KO: Record<string, string> = {
  'Service Notice': '서비스 공지',
  'MySNU Notice': '마이스누',
  'CSE Notice': '컴퓨터공학부',
  'Career Notice': '경력개발센터',
  'SNUTI Notice': '첨단융합학부',
};
