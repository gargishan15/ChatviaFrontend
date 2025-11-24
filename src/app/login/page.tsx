'use client';
import React, { useState } from 'react'
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { redirect, useRouter } from 'next/navigation';
import axios from 'axios';
import { user_service } from '@/context/AppContext';
import { useAppData } from '@/context/AppContext';
import Loading from '@/components/Loading';
import { toast } from 'react-hot-toast';


const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const { isAuth, loading } = useAppData();


  const handleSubmit = async (e: React.FormEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${user_service}/api/v1/login`, { email });

      toast.success(data.message);
      router.push(`/verify?email=${email}`);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");

    } finally {
      setIsLoading(false);
    }

  }
  if (loading) {
    return <Loading />;
  }
  if (isAuth) {
    redirect('/chat');
  }

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>

        <div className='bg-gray-800 border border-gray-700 rounded-lg p-8'>

          <div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6'>
            <Mail size={40} className='text-white' />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 whitespace-nowrap text-center">Welcome to Chatvia</h1>
          <p className='text-gray-300 text-lg mb-6 text-center'>Enter your Email to continue</p>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label htmlFor="email" className='block text-sm font-medium text-gray-300 mb-2'>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className='w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400'
                placeholder='Enter your email address'
                value={email} onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type='submit'
              className='w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed' disabled={isLoading}>
              {
                isLoading ? (<div className='flex items-center justify-center gap-2'>
                  <Loader2 className='w-5 h-5' />
                  Sending OTP to ypur mail...
                </div>) :
                  (<div className='flex items-center justify-center gap-2'>
                    <span>Send Verification code</span>
                    <ArrowRight className='w-5 h-5' />
                  </div>
                  )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

export default LoginPage
