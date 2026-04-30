import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { User, FileText, Star, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ResumeUploader from '../components/ResumeUploader';
import StudentDetailsView from '../components/StudentDetailsView';
import useAuthStore from '../store/authStore';

const StudentProfile = () => {
  const { id } = useParams();
  const isAdminView = !!id;
  const { user, updateProfile } = useAuthStore();
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = isAdminView ? `/api/admin/students/${id}` : '/api/students/profile';
        const res = await axiosInstance.get(endpoint);
        setProfileData(res.data);
        reset(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [id, isAdminView, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      const res = await axiosInstance.put('/api/students/profile', data);
      updateProfile(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{isAdminView ? 'Student Profile' : 'My Profile'}</h1>
        <p className="text-slate-500">{isAdminView ? `Viewing details for ${profileData?.name || 'Student'}` : 'Manage your academic details and resume'}</p>
      </header>

      {isAdminView ? (
        profileData ? <StudentDetailsView data={profileData} /> : <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-600" size={30} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center border-b pb-4 mb-6">
                <User className="mr-2 text-primary-600" />
                Personal & Academic Info
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Roll Number</label>
                  <input {...register('rollNumber')} className="input" placeholder="e.g. CS2021001" disabled={isAdminView} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                  <select {...register('department')} className="input" disabled={isAdminView}>
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Agriculture">Agriculture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">College</label>
                  <input {...register('college')} className="input" placeholder="e.g. ABC College of Engineering" disabled={isAdminView} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Batch Year</label>
                  <input type="number" {...register('batchYear')} className="input" placeholder="2025" disabled={isAdminView} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">CGPA</label>
                  <input type="number" step="0.01" {...register('cgpa')} className="input" placeholder="8.50" disabled={isAdminView} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Skills (Comma separated)</label>
                <textarea 
                  {...register('skills')} 
                  className="input h-24 pt-2" 
                  placeholder="Java, React, SQL, AWS..."
                  disabled={isAdminView}
                />
              </div>

              {saveSuccess && (
                <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">Profile updated successfully!</span>
                </div>
              )}
              {saveError && (
                <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl">
                  <AlertCircle size={18} />
                  <span className="text-sm font-medium">{saveError}</span>
                </div>
              )}

              {!isAdminView && (
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          <div>
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center">
                <FileText className="mr-2 text-primary-600" />
                Resume
              </h2>
              <ResumeUploader 
                initialUrl={isAdminView ? profileData?.resumeUrl : user?.profile?.resumeUrl} 
                onUploadSuccess={(url) => updateProfile({ ...user.profile, resumeUrl: url })} 
                readOnly={isAdminView}
              />
            </div>
            
            <div className="card p-6 mt-6 bg-primary-600 text-white border-none">
              <h3 className="font-bold flex items-center mb-2">
                <Star className="mr-2" size={20} />
                Placement Status
              </h3>
              <p className="text-primary-100 text-sm">
                {isAdminView 
                  ? (profileData?.placed ? "This student has been placed." : "This student is currently eligible for recruitment.")
                  : (user?.profile?.placed ? "Congratulations! You have been placed." : "You are currently eligible for recruitment. Keep applying!")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
