'use client'

import { InputHTMLAttributes, ReactNode } from "react"

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function FormInput({
  label,
  error,
  ...props
}: FormInputProps): ReactNode {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="text-xs font-bold text-gray-700 tracking-wide block mb-2"
      >
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
