"use client"
import Link from "next/link"
import type React from "react"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Car,
  Users,
  Settings,
  HelpCircle,
  Calendar,
  Bell,
  Home,
  ChevronDown,
  ChevronRight,
  Shield,
  LogOut,
  ClipboardCheck,
  User,
  UserPlus,
  ListFilter,
  PlusCircle,
} from "lucide-react"
import Logo from "./logo"

type MenuItem = {
  icon: React.ElementType
  label: string
  href: string
  submenu?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    icon: Home,
    label: "대시보드",
    href: "/",
  },
  {
    icon: Car,
    label: "빠른 등록",
    href: "/register",
  },
  {
    icon: ClipboardCheck,
    label: "접수 관리",
    href: "/admin/applications",
  },
  {
    icon: Calendar,
    label: "성도 차량",
    href: "/admin/bulk-edit",
  },
  {
    icon: Users,
    label: "사용자 관리",
    href: "/admin/users",
    submenu: [
      {
        icon: ListFilter,
        label: "사용자 목록",
        href: "/admin/users/list",
      },
      {
        icon: UserPlus,
        label: "사용자 추가",
        href: "/admin/users/add",
      },
    ],
  },
  {
    icon: Bell,
    label: "공지 관리",
    href: "/admin/notices",
    submenu: [
      {
        icon: ListFilter,
        label: "공지 목록",
        href: "/admin/notices/list",
      },
      {
        icon: PlusCircle,
        label: "공지 추가",
        href: "/admin/notices/add",
      },
    ],
  },
  {
    icon: Shield,
    label: "권한 관리",
    href: "/admin/permissions",
  },
  {
    icon: Settings,
    label: "시스템 관리",
    href: "/admin/settings",
  },
  {
    icon: HelpCircle,
    label: "도움말",
    href: "/admin/help",
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    // 현재 경로가 하위 메뉴에 있는지 확인하고 해당 상위 메뉴를 열어둠
    menuItems.forEach((item) => {
      if (
        item.submenu &&
        item.submenu.some((subitem) => pathname === subitem.href || pathname.startsWith(subitem.href + "/"))
      ) {
        setOpenSubmenu(item.href)
      }
    })
  }, [pathname])

  const toggleSubmenu = (href: string) => {
    setOpenSubmenu((prev) => (prev === href ? null : href))
  }

  const isActive = (href: string) => pathname === href
  const hasActiveSubmenu = (item: MenuItem) =>
    item.submenu && item.submenu.some((subitem) => pathname === subitem.href || pathname.startsWith(subitem.href + "/"))

  if (!mounted) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-30">
        <div className="p-6 border-b border-gray-200">
          <Logo showLink={false} />
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600">
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-30">
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <Logo showLink={false} />
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const hasActiveChild = hasActiveSubmenu(item)
            const isOpen = openSubmenu === item.href

            return (
              <li key={item.href} className={item.submenu ? "mb-1" : ""}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.href)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active || hasActiveChild || isOpen
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </div>
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {isOpen && (
                      <ul className="mt-1 ml-4 pl-2 border-l border-gray-200 space-y-1">
                        {item.submenu.map((subitem) => {
                          const SubIcon = subitem.icon
                          const subActive = isActive(subitem.href) || pathname.startsWith(subitem.href + "/")

                          return (
                            <li key={subitem.href}>
                              <Link
                                href={subitem.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  subActive
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                              >
                                <SubIcon className="w-4 h-4" />
                                {subitem.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 하단 정보 */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
        <div className="p-4">
          <div className="text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4" />
              <span>관리자님</span>
            </div>
            <div className="text-gray-400">직책: 시스템 관리자</div>
          </div>
          <button
            onClick={() => {
              if (confirm("로그아웃 하시겠습니까?")) {
                // 로그아웃 로직 - 실제 구현 시 인증 시스템에 맞게 수정
                localStorage.clear()
                sessionStorage.clear()
                window.location.href = "/login"
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
