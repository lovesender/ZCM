// 사용자 입력 검증 유틸리티

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// UserFormData 인터페이스 수정
export interface UserFormData {
  name: string
  telegramId: string // email에서 telegramId로 변경
  phone: string
  position: string
  role: string
  branch: string
  department: string
  status?: string
}

// 이름 검증
export function validateName(name: string): ValidationResult {
  const errors: string[] = []

  if (!name.trim()) {
    errors.push("이름은 필수 입력 항목입니다.")
  } else if (name.trim().length < 2) {
    errors.push("이름은 최소 2글자 이상이어야 합니다.")
  } else if (name.trim().length > 20) {
    errors.push("이름은 최대 20글자까지 입력 가능합니다.")
  } else if (!/^[가-힣a-zA-Z\s]+$/.test(name.trim())) {
    errors.push("이름은 한글, 영문, 공백만 입력 가능합니다.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 이메일 검증 함수를 텔레그램 ID 검증 함수로 변경
// validateEmail 함수를 validateTelegramId 함수로 변경
export function validateTelegramId(
  telegramId: string,
  existingIds: string[] = [],
  currentId?: string,
): ValidationResult {
  const errors: string[] = []

  if (!telegramId.trim()) {
    errors.push("텔레그램 ID는 필수 입력 항목입니다.")
  } else {
    // 텔레그램 ID 형식 검사 (@ 로 시작)
    if (!telegramId.trim().startsWith("@")) {
      errors.push("텔레그램 ID는 @로 시작해야 합니다.")
    } else if (telegramId.trim().length < 5) {
      errors.push("텔레그램 ID는 최소 5글자 이상이어야 합니다.")
    } else if (telegramId.trim().length > 32) {
      errors.push("텔레그램 ID는 최대 32글자까지 입력 가능합니다.")
    } else if (!/^@[a-zA-Z0-9_]+$/.test(telegramId.trim())) {
      errors.push("텔레그램 ID는 영문, 숫자, 밑줄(_)만 포함할 수 있습니다.")
    } else {
      // 중복 검사 (현재 ID 제외)
      const filteredIds = currentId ? existingIds.filter((e) => e !== currentId) : existingIds

      if (filteredIds.includes(telegramId.trim().toLowerCase())) {
        errors.push("이미 사용 중인 텔레그램 ID입니다.")
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 연락처 검증
export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = []

  if (phone.trim()) {
    const phoneRegex = /^010-\d{4}-\d{4}$/
    if (!phoneRegex.test(phone.trim())) {
      errors.push("연락처는 010-0000-0000 형식으로 입력해주세요.")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 직급 검증 함수 이름은 유지하되 메시지 변경
export function validatePosition(position: string): ValidationResult {
  const errors: string[] = []

  if (position.trim() && position.trim().length > 20) {
    errors.push("직책은 최대 20글자까지 입력 가능합니다.")
  }

  if (position.trim() && !/^[가-힣a-zA-Z0-9\s]+$/.test(position.trim())) {
    errors.push("직책은 한글, 영문, 숫자, 공백만 입력 가능합니다.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 역할 검증
export function validateRole(role: string): ValidationResult {
  const errors: string[] = []
  const validRoles = ["관리자", "사용자", "뷰어"]

  if (!role.trim()) {
    errors.push("역할은 필수 선택 항목입니다.")
  } else if (!validRoles.includes(role.trim())) {
    errors.push("올바른 역할을 선택해주세요.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 지파 검증
export function validateBranch(branch: string, validBranches: string[]): ValidationResult {
  const errors: string[] = []

  if (!branch.trim()) {
    errors.push("지파는 필수 선택 항목입니다.")
  } else if (!validBranches.includes(branch.trim())) {
    errors.push("올바른 지파를 선택해주세요.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 부서 검증
export function validateDepartment(department: string, validDepartments: string[]): ValidationResult {
  const errors: string[] = []

  if (!department.trim()) {
    errors.push("부서는 필수 선택 항목입니다.")
  } else if (!validDepartments.includes(department.trim())) {
    errors.push("올바른 부서를 선택해주세요.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 상태 검증
export function validateStatus(status: string): ValidationResult {
  const errors: string[] = []
  const validStatuses = ["활성", "비활성", "대기"]

  if (status && !validStatuses.includes(status.trim())) {
    errors.push("올바른 상태를 선택해주세요.")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// validateUserForm 함수에서 email -> telegramId로 변경
export function validateUserForm(
  formData: UserFormData,
  existingIds: string[],
  validBranches: string[],
  validDepartments: string[],
  currentId?: string,
): ValidationResult {
  const allErrors: string[] = []

  // 각 필드 검증
  const nameValidation = validateName(formData.name)
  const telegramIdValidation = validateTelegramId(formData.telegramId, existingIds, currentId) // email -> telegramId
  const phoneValidation = validatePhone(formData.phone)
  const positionValidation = validatePosition(formData.position)
  const roleValidation = validateRole(formData.role)
  const branchValidation = validateBranch(formData.branch, validBranches)
  const departmentValidation = validateDepartment(formData.department, validDepartments)
  const statusValidation = formData.status ? validateStatus(formData.status) : { isValid: true, errors: [] }

  // 모든 오류 수집
  allErrors.push(
    ...nameValidation.errors,
    ...telegramIdValidation.errors, // emailValidation -> telegramIdValidation
    ...phoneValidation.errors,
    ...positionValidation.errors,
    ...roleValidation.errors,
    ...branchValidation.errors,
    ...departmentValidation.errors,
    ...statusValidation.errors,
  )

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  }
}

// validateField 함수에서 email -> telegramId로 변경
export function validateField(
  fieldName: keyof UserFormData,
  value: string,
  context: {
    existingEmails?: string[]
    validBranches?: string[]
    validDepartments?: string[]
    currentEmail?: string
  } = {},
): ValidationResult {
  switch (fieldName) {
    case "name":
      return validateName(value)
    case "telegramId": // email에서 telegramId로 변경
      return validateTelegramId(value, context.existingEmails || [], context.currentEmail)
    case "phone":
      return validatePhone(value)
    case "position":
      return validatePosition(value)
    case "role":
      return validateRole(value)
    case "branch":
      return validateBranch(value, context.validBranches || [])
    case "department":
      return validateDepartment(value, context.validDepartments || [])
    case "status":
      return validateStatus(value)
    default:
      return { isValid: true, errors: [] }
  }
}

// 보안 검증 (XSS 방지)
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // HTML 태그 제거
    .replace(/javascript:/gi, "") // JavaScript 프로토콜 제거
    .replace(/on\w+=/gi, "") // 이벤트 핸들러 제거
}

// INPUT_LIMITS 객체 수정
export const INPUT_LIMITS = {
  name: { min: 2, max: 20 },
  telegramId: { min: 5, max: 32 }, // email에서 telegramId로 변경
  phone: { exact: 13 }, // 010-0000-0000
  position: { min: 0, max: 20 },
} as const
