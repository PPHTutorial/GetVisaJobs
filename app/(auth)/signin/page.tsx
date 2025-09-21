import { Metadata } from 'next'
import Image from 'next/image'
import { SignInForm } from './components/signin-form'

export const metadata: Metadata = {
  title: 'Sign In | No Stress Visa Jobs',
  description: 'Sign in to your No Stress Visa Jobs account',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex justify-center">
      {/* Hero Section - Hidden on small screens, visible on large screens */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 to-emerald-50 dark:from-emerald-950 dark:to-emerald-950 items-center justify-center p-12">
        <div className="text-center">
          <Image
            src="/hero.svg"
            alt="No Stress Visa Jobs Hero"
            width={256}
            height={256}
            className="w-120 h-120 mx-auto mb-8 opacity-80"
          />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome Back
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Sign in to access your personalized job dashboard and discover visa-sponsored opportunities.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="flex flex-col items-center w-full max-w-lg space-y-8">
          <div className="text-center  lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  )
}