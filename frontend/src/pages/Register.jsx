import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserCircle, Building2, Loader2, AlertCircle, ShieldCheck, Globe, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const Register = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { role: 'STUDENT' }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const selectedRole = watch('role');



  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/api/auth/register', data);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2">Join the PlacementPortal network</p>
        </div>

        <div className="card p-8 shadow-2xl">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 p-4 rounded-xl flex items-start space-x-3 mb-6">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <label className={`cursor-pointer flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'STUDENT' ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/20' : 'border-slate-200 dark:border-slate-800'
              }`}>
                <input {...register('role')} type="radio" value="STUDENT" className="hidden" />
                <UserCircle className={selectedRole === 'STUDENT' ? 'text-primary-600' : 'text-slate-400'} size={32} />
                <span className="font-bold mt-2 text-xs">Student</span>
              </label>

              <label className={`cursor-pointer flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'COMPANY' ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/20' : 'border-slate-200 dark:border-slate-800'
              }`}>
                <input {...register('role')} type="radio" value="COMPANY" className="hidden" />
                <Building2 className={selectedRole === 'COMPANY' ? 'text-primary-600' : 'text-slate-400'} size={32} />
                <span className="font-bold mt-2 text-xs">Company</span>
              </label>

              <label className={`cursor-pointer flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'ADMIN' ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/20' : 'border-slate-200 dark:border-slate-800'
              }`}>
                <input {...register('role')} type="radio" value="ADMIN" className="hidden" />
                <ShieldCheck className={selectedRole === 'ADMIN' ? 'text-primary-600' : 'text-slate-400'} size={32} />
                <span className="font-bold mt-2 text-xs">Admin</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {selectedRole === 'STUDENT' ? 'Full Name' : selectedRole === 'COMPANY' ? 'Company Name' : 'Admin Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="input pl-10"
                    placeholder={selectedRole === 'STUDENT' ? 'John Doe' : 'Acme Corp'}
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    {...register('email', { required: 'Email is required' })}
                    className="input pl-10"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    {...register('phone')}
                    className="input pl-10"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {selectedRole === 'COMPANY' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Official Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        {...register('website', { required: selectedRole === 'COMPANY' ? 'Website is required' : false })}
                        className="input pl-10"
                        placeholder="https://acme.com"
                      />
                    </div>
                    {errors.website && <p className="text-rose-500 text-xs mt-1">{errors.website.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">HR Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        {...register('hrName', { required: selectedRole === 'COMPANY' ? 'HR Name is required' : false })}
                        className="input pl-10"
                        placeholder="Sarah Connor"
                      />
                    </div>
                    {errors.hrName && <p className="text-rose-500 text-xs mt-1">{errors.hrName.message}</p>}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 flex items-center justify-center space-x-2 text-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : null}
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
