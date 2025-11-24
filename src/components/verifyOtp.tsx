'use client';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { useSearchParams, useRouter, redirect } from 'next/navigation';
import React, { useEffect, useRef } from 'react'
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useAppData, user_service } from '@/context/AppContext';
import Loading from './Loading';
import { toast } from 'react-hot-toast';

const VerifyOtp = () => {
    const { isAuth, setIsAuth, setUser, loading, fetchChats, fetchUsers } = useAppData();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string>("")
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState(60);
    const inputRef = useRef<HTMLInputElement[]>([]);
    const router = useRouter();


    const searchParams = useSearchParams();

    const email: string = searchParams.get('email') || "";

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    console.log(timer);

    const handleInputChange = (index: number, value: string): void => {
        if (value.length > 1) return;

        const newOtp: string[] = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        if (value && index < 5) {
            inputRef.current?.[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLElement>): void => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRef.current?.[index - 1]?.focus();
        }
    };
    const handlePaste = (e: React.ClipboardEvent<HTMLElement>): void => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("Text")
        const digits = pasteData.replace(/\D/g, "").slice(0, 6);
        if (digits.length === 6) {
            const newOtp = digits.split("");
            setOtp(newOtp);
            inputRef.current?.[5]?.focus();
        }

    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const otpString = otp.join("")
        if (otpString.length < 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }
        setIsLoading(true);
        setError("");

        try {
            const { data } = await axios.post(`${user_service}/api/v1/verify`, { email, otp: otpString });
            toast.success(data.message);
            Cookies.set('token', data.token, { expires: 30, secure: false, path: '/' });
            setOtp(["", "", "", "", "", ""]);
            inputRef.current[0]?.focus();
            setUser(data.user);
            setIsAuth(true);
            fetchChats();
            fetchUsers();

        } catch (error: any) {
            setError(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        setError("");
        try {
            const { data } = await axios.post(`${user_service}/api/v1/login`, { email });
            toast.success(data.message);
            setTimer(60);
        } catch (error: any) {
            setError(error.response?.data?.message || "Something went wrong");
        } finally {
            setResendLoading(false);
        }
    };

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
                        <Lock size={40} className='text-white' />
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-3 text-center">Verify Your Email</h1>
                    <p className='text-gray-300 text-lg  text-center'>We have sent a 6 digit code to </p>
                    <p className='text-blue-400 font-medium text-center mb-2'>{email}</p>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label className='block text-sm font-medium text-gray-300 mb-4 text-center'>
                                Enter your 6-digit OTP here
                            </label>
                            <div className="flex justify-center gap-2 sm:gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                       ref={(el) => { if (el) inputRef.current[index] = el; }}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-10 h-12 text-center text-xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg sm:w-12"
                                    />
                                ))}
                            </div>


                        </div>
                        {error && (
                            <div className='bg-red-900 border border-red-700 rounded-lg p-3'>
                                <p className='text-red-300 text-sm text-center'>{error}</p>
                            </div>
                        )}

                        <button
                            type='submit'
                            className='w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed' disabled={isLoading}
                        >
                            {
                                isLoading ? (<div className='flex items-center justify-center gap-2'>
                                    <Loader2 className='w-5 h-5' />
                                    Verifying...
                                </div>) :
                                    (<div className='flex items-center justify-center gap-2'>
                                        <span>Verify</span>
                                        <ArrowRight className='w-5 h-5' />
                                    </div>
                                    )}
                        </button>
                    </form>
                    <div className='mt-6 text-center'>
                        <p className='text-gray-400 text-sm mb-4'>Didn't recieve the code?</p>
                        {
                            timer > 0 ? (
                                <p className='text-gray-400 text-sm '>Resend  Code in {timer} seconds</p>
                            ) : (
                                <button className='text-blue-400 hover:text-blue-300 text-sm font-medium disabled:opacity-50' disabled={resendLoading} onClick={handleResendOtp}>
                                    {
                                        resendLoading ? (<div className='flex items-center justify-center gap-2'>
                                            <Loader2 className='w-5 h-5' />
                                            Resending...
                                        </div>) : ("Resend Code")
                                    }
                                </button>
                            )
                        }
                    </div>

                </div>
            </div>
        </div>
    )

}

export default VerifyOtp