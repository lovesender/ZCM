import Link from "next/link"
import { Car } from "lucide-react"

interface LogoProps {
  linkTo?: string
  showLink?: boolean
}

export default function Logo({ linkTo = "/", showLink = true }: LogoProps) {
  const LogoContent = () => (
    <>
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <Car className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">ZCM</h1>
        <p className="text-xs text-gray-500 leading-tight">차량 관리 시스템</p>
      </div>
    </>
  )

  if (showLink) {
    return (
      <Link href={linkTo} className="flex items-center space-x-2">
        <LogoContent />
      </Link>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <LogoContent />
    </div>
  )
}
