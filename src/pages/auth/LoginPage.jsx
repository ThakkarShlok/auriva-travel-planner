import React from 'react'
import { SignIn } from '@clerk/clerk-react'
import AuthLayout from '../../components/ui/AuthLayout'
import usePageTitle from '../../hooks/usePageTitle'

const LoginPage = () => {
  usePageTitle('Sign in')

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your saved trips and continue planning."
    >
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/register"
        forceRedirectUrl="/dashboard"
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

export default LoginPage
