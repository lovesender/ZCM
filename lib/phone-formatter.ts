/**
 * 연락처 자동 하이픈 포맷팅 함수
 * @param value 입력된 연락처 문자열
 * @returns 하이픈이 포함된 포맷팅된 연락처
 */
export const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, "")

  // 길이에 따라 포맷팅
  if (numbers.length <= 3) {
    return numbers
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }
}

/**
 * 연락처 유효성 검사 함수
 * @param phoneNumber 검사할 연락처 문자열
 * @returns 유효한 연락처 형식이면 true, 아니면 false
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/
  return phoneRegex.test(phoneNumber)
}
