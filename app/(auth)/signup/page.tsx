import { Metadata } from 'next'
import Image from 'next/image'
import { SignUpForm } from './components/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up | No Stress Visa Jobs',
  description: 'Create your No Stress Visa Jobs account',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Hero Section - Hidden on small screens, visible on large screens */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950 dark:to-emerald-950 items-center justify-center p-12">
        <div className="text-center">
          <Image
            src="/hero.svg"
            alt="No Stress Visa Jobs Hero"
            width={256}
            height={256}
            className="w-120 h-120 mx-auto mb-8 opacity-80"
          />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Join Us Today
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Create your account and start exploring visa-sponsored job opportunities around the world.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-xl space-y-8">
          <div className="flex flex-col items-center text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Join No Stress Visa Jobs and start your journey
            </p>
          </div>

          <SignUpForm />
        </div>
      </div>
    </div>
  )
}