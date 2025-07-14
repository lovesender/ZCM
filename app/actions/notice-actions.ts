"use server"

export interface Notice {
  id: number
  title: string
  content: string
  category: string
  status: string
  author: string
  viewCount: number
  isPinned: boolean
  isImportant: boolean
  createdAt: string
  updatedAt: string
}

// 모의 공지사항 데이터
const mockNotices: Notice[] = [
  {
    id: 1,
    title: "차량 등록 마감 안내",
    content: "2024년 1월 차량 등록이 곧 마감됩니다. 아직 등록하지 않으신 분들은 서둘러 등록해 주시기 바랍니다.",
    category: "중요",
    status: "게시",
    author: "관리자",
    viewCount: 156,
    isPinned: true,
    isImportant: true,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z",
  },
  {
    id: 2,
    title: "주차장 이용 수칙 변경",
    content: "새로운 주차장 이용 수칙이 적용됩니다. 자세한 내용은 공지사항을 확인해 주세요.",
    category: "일반",
    status: "게시",
    author: "관리자",
    viewCount: 89,
    isPinned: false,
    isImportant: false,
    createdAt: "2024-01-08T14:30:00Z",
    updatedAt: "2024-01-08T14:30:00Z",
  },
  {
    id: 3,
    title: "시스템 점검 안내",
    content: "1월 20일 시스템 점검이 예정되어 있습니다. 점검 시간 동안 서비스 이용이 제한될 수 있습니다.",
    category: "시스템",
    status: "게시",
    author: "시스템관리자",
    viewCount: 234,
    isPinned: false,
    isImportant: true,
    createdAt: "2024-01-05T16:00:00Z",
    updatedAt: "2024-01-05T16:00:00Z",
  },
]

export async function getRecentNotices(limit = 5) {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockNotices.slice(0, limit)
}

export async function getNotices(params: {
  category?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredNotices = [...mockNotices]

  // 필터링
  if (params.category) {
    filteredNotices = filteredNotices.filter((notice) => notice.category === params.category)
  }

  if (params.status) {
    filteredNotices = filteredNotices.filter((notice) => notice.status === params.status)
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredNotices = filteredNotices.filter(
      (notice) =>
        notice.title.toLowerCase().includes(searchLower) || notice.content.toLowerCase().includes(searchLower),
    )
  }

  // 페이지네이션
  const page = params.page || 1
  const limit = params.limit || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  const paginatedNotices = filteredNotices.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredNotices.length / limit)

  return {
    notices: paginatedNotices,
    totalPages,
    currentPage: page,
    totalCount: filteredNotices.length,
  }
}

export async function createNotice(data: Omit<Notice, "id" | "viewCount" | "createdAt" | "updatedAt">) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newNotice: Notice = {
    ...data,
    id: mockNotices.length + 1,
    viewCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockNotices.unshift(newNotice)

  return {
    success: true,
    message: "공지사항이 성공적으로 등록되었습니다.",
    notice: newNotice,
  }
}

export async function updateNotice(id: number, data: Partial<Notice>) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const index = mockNotices.findIndex((notice) => notice.id === id)
  if (index === -1) {
    return {
      success: false,
      message: "공지사항을 찾을 수 없습니다.",
    }
  }

  mockNotices[index] = {
    ...mockNotices[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  return {
    success: true,
    message: "공지사항이 성공적으로 수정되었습니다.",
    notice: mockNotices[index],
  }
}

export async function deleteNotice(id: number) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = mockNotices.findIndex((notice) => notice.id === id)
  if (index === -1) {
    return {
      success: false,
      message: "공지사항을 찾을 수 없습니다.",
    }
  }

  mockNotices.splice(index, 1)

  return {
    success: true,
    message: "공지사항이 성공적으로 삭제되었습니다.",
  }
}
