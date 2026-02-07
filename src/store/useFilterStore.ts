import { create } from 'zustand';

interface FilterState {
  keyword: string;
  activeBoardIds: number[];
  setKeyword: (keyword: string) => void;
  setActiveBoardIds: (ids: number[]) => void;
  // 초기화: URL에 값이 있을 때만 스토어를 채움
  initialize: (initialKeyword: string, initialIds: number[]) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  keyword: '',
  activeBoardIds: [],
  setKeyword: (keyword) => set({ keyword }),
  setActiveBoardIds: (activeBoardIds) => set({ activeBoardIds }),
  initialize: (keyword, activeBoardIds) =>
    set((state) => ({
      // 이미 스토어에 데이터가 있다면(이동 후 복귀 시) URL 값으로 덮어쓰지 않고 유지
      keyword: state.keyword || keyword,
      activeBoardIds:
        state.activeBoardIds.length > 0 ? state.activeBoardIds : activeBoardIds,
    })),
}));
