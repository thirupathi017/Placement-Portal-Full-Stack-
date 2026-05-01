import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { User, FileText, Star, Save, Loader2, CheckCircle, AlertCircle, Trash2, TriangleAlert, X } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ResumeUploader from '../components/ResumeUploader';
import StudentDetailsView from '../components/StudentDetailsView';
import useAuthStore from '../store/authStore';

const StudentProfile = () => {
  const { id } = useParams();
  const isAdminView = !!id;
  const { user, updateProfile, logout } = useAuthStore();
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete('/api/auth/me');
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      alert('Failed to delete account. Please try again later.');
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

      {!isAdminView && (
        <div className="mt-8 border-t border-rose-200 dark:border-rose-900/50 pt-8">
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-2">Danger Zone</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              id="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
              className="btn bg-rose-600 hover:bg-rose-700 text-white border-none whitespace-nowrap flex items-center space-x-2"
            >
              <Trash2 size={18} />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !deleteLoading && setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-rose-200 dark:border-rose-900/50" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-950 rounded-xl">
                  <TriangleAlert className="text-rose-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Account</h3>
              </div>
              {!deleteLoading && (
                <button onClick={() => setShowDeleteModal(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Are you absolutely sure? This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1 mb-6 pl-2">
              <li>Your account and personal information</li>
              <li>Your academic profile and resume</li>
              <li>All your job applications</li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="btn bg-rose-600 hover:bg-rose-700 text-white border-none flex-1 flex items-center justify-center space-x-2"
              >
                {deleteLoading ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                <span>{deleteLoading ? 'Deleting...' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
