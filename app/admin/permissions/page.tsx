"use client"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionMatrix } from "@/components/permission-matrix"
import { RoleManagement } from "@/components/role-management"
import { PermissionHistoryComponent } from "@/components/permission-history"
import { Shield, Users, History } from "lucide-react"
import { CURRENT_PERMISSIONS } from "@/app/config/permissions"
import { savePermissions } from "@/app/actions/permission-actions"

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState("permissions")

  // 브레드크럼 데이터
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "권한 관리" }]

  // 권한 저장 핸들러
  const handleSavePermissions = async (permissions: typeof CURRENT_PERMISSIONS) => {
    try {
      const result = await savePermissions(permissions, "권한 매트릭스 업데이트")
      return result.success
    } catch (error) {
      console.error("권한 저장 중 오류 발생:", error)
      return false
    }
  }

  return (
    <PageLayout title="권한 관리" description="사용자 역할 및 권한을 관리합니다" breadcrumbs={breadcrumbs}>
      <Card>
        <CardHeader>
          <CardTitle>권한 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                권한 매트릭스
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                역할 관리
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                변경 이력
              </TabsTrigger>
            </TabsList>

            <TabsContent value="permissions">
              <PermissionMatrix initialPermissions={CURRENT_PERMISSIONS} onSave={handleSavePermissions} />
            </TabsContent>

            <TabsContent value="roles">
              <RoleManagement />
            </TabsContent>

            <TabsContent value="history">
              <PermissionHistoryComponent />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
