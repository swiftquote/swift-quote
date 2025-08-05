"use client"

import { useSearchParams } from "next/navigation"

export default function RegisterForm() {
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref")

  return (
    <form>
      {ref && <p>Referral: {ref}</p>}
      {/* Add your register form fields here */}
    </form>
  )
}
