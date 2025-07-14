// 성능 최적화 설정 (강화)
export const PERFORMANCE_CONFIG = {
  // 가상화 설정
  VIRTUALIZATION: {
    ITEM_HEIGHT: 120,
    OVERSCAN: 3, // 줄임
    BUFFER_SIZE: 5, // 줄임
    THRESHOLD: 50, // 50개 이상일 때만 가상화
  },

  // 캐싱 설정 (강화)
  CACHE: {
    VEHICLE_LIST_TTL: 3 * 60 * 1000, // 3분으로 단축
    STATISTICS_TTL: 5 * 60 * 1000, // 5분으로 단축
    USER_DATA_TTL: 10 * 60 * 1000, // 10분으로 단축
    IMAGE_TTL: 24 * 60 * 60 * 1000, // 24시간
    MAX_CACHE_SIZE: 50, // 최대 캐시 항목
  },

  // 디바운싱 설정 (최적화)
  DEBOUNCE: {
    SEARCH: 200, // 더 빠른 응답
    FILTER: 150,
    RESIZE: 50,
    SCROLL: 16, // 60fps
  },

  // 페이지네이션 설정
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 15, // 줄임
    MAX_PAGE_SIZE: 50, // 줄임
    PREFETCH_PAGES: 1, // 줄임
  },

  // 이미지 최적화
  IMAGE: {
    LAZY_LOAD_THRESHOLD: 50, // 더 빠른 로딩
    PLACEHOLDER_QUALITY: 5, // 더 낮은 품질
    WEBP_SUPPORT: true,
    SIZES: {
      THUMBNAIL: 150,
      MEDIUM: 400,
      LARGE: 800,
    },
  },

  // 네트워크 최적화
  NETWORK: {
    RETRY_ATTEMPTS: 2, // 줄임
    RETRY_DELAY: 500,
    TIMEOUT: 8000, // 8초
    CONCURRENT_REQUESTS: 3, // 동시 요청 제한
  },

  // 렌더링 최적화
  RENDERING: {
    RAF_THROTTLE: true, // requestAnimationFrame 사용
    BATCH_UPDATES: true, // 배치 업데이트
    MEMO_THRESHOLD: 10, // 10개 이상 항목에서 메모화
  },
}
