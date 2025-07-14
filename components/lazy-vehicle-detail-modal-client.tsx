"use client"

import dynamic from "next/dynamic"
import LoadingSpinner from "./ui/loading-spinner"

// Lazily load the vehicle detail modal (client-side only)
const VehicleDetailModal = dynamic(() => import("./vehicle-detail-modal").then((mod) => mod.default), {
  loading: () => <LoadingSpinner />,
  ssr: false,
})

export default VehicleDetailModal
