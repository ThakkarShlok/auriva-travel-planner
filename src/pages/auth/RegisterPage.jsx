import React from 'react'
import { SignUp } from '@clerk/clerk-react'
import AuthLayout from '../../components/UI/AuthLayout'
import usePageTitle from '../../hooks/usePageTitle'

const RegisterPage = () => {
  usePageTitle('Create account')

  return (
    <AuthLayout
      title="Start planning"
      subtitle="Create an account to save your trips and refine them anytime."
    >
      <SignUp
        path="/register"
        routing="path"
        signInUrl="/login"
        forceRedirectUrl="/plan"
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none border-0 bg-transparent p-0',
            headerTitle: 'hidden',
            headerSubtitle: 'hidden',
            socialButtonsBlockButton: 'border border-slate-200 hover:bg-slate-50',
            formButtonPrimary: 'bg-primary-800 hover:bg-primary-900',
            footerActionLink: 'text-primary-700 hover:text-primary-800',
          },
        }}
      />
    </AuthLayout>
  )
}

export default RegisterPage
