// Change the default export to a named export
export function LoadingSpinner({
  className = "",
  size = "medium",
}: { className?: string; size?: "small" | "medium" | "large" }) {
  // Size classes
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-2",
    large: "h-12 w-12 border-3",
  }

  return (
    <div className={`flex justify-center items-center py-4 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full border-t-blue-500 border-blue-200 animate-spin`} />
    </div>
  )
}

// Also provide a default export for backward compatibility
export default LoadingSpinner
