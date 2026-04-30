import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, FileText, MapPin, Calendar, IndianRupee, GraduationCap, Save, Loader2, ArrowLeft } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const PostJob = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: {
      status: 'OPEN',
      jobType: 'FULL_TIME',
      eligibleDepartments: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      const fetchJob = async () => {
        try {
          const res = await axiosInstance.get(`/api/jobs/${id}`);
          const jobData = res.data;
          // Convert eligibleDepartments string to array for checkboxes if it's a string
          if (jobData.eligibleDepartments && typeof jobData.eligibleDepartments === 'string') {
            jobData.eligibleDepartments = jobData.eligibleDepartments.split(',').map(d => d.trim());
          }
          reset(jobData);
        } catch (err) {
          console.error(err);
          alert('Failed to fetch job details');
          navigate('/company/jobs');
        } finally {
          setFetching(false);
        }
      };
      fetchJob();
    }
  }, [id, isEditing, reset, navigate]);



  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Create a clean payload for the backend - remove read-only/internal fields
      const { company, applicantsCount, rounds, createdAt, applications, ...cleanData } = data;
      
      const payload = {
        ...cleanData,
        eligibleDepartments: Array.isArray(cleanData.eligibleDepartments) 
          ? cleanData.eligibleDepartments.join(', ') 
          : cleanData.eligibleDepartments
      };
      
      if (isEditing) {
        await axiosInstance.put(`/api/jobs/${id}`, payload);
        alert('Job updated successfully!');
      } else {
        await axiosInstance.post('/api/jobs', payload);
        alert('Job posted successfully!');
      }
      navigate('/company/jobs');
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'post'} job`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 hover:text-primary-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back to Jobs
      </button>

      <header className="mb-8">
        <h1 className="text-3xl font-bold">{isEditing ? 'Edit Opportunity' : 'Post New Opportunity'}</h1>
        <p className="text-slate-500">Provide details about the job role and eligibility criteria</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                {...register('title', { required: 'Title is required' })}
                className="input pl-10" 
                placeholder="e.g. Software Engineer II" 
              />
            </div>
            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Job Type</label>
            <select {...register('jobType')} className="input">
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="CONTRACT">Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input {...register('location', { required: 'Location is required' })} className="input pl-10" placeholder="e.g. Bangalore, India" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Package (LPA)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="number" step="0.01" {...register('packageLpa', { required: 'Package is required' })} className="input pl-10" placeholder="12.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Application Deadline</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="date" {...register('lastDate', { required: 'Deadline is required' })} className="input pl-10" />
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hiring Status</label>
              <select {...register('status')} className="input">
                <option value="OPEN">Open (Accepting Applications)</option>
                <option value="CLOSED">Closed (Hiring Paused)</option>
              </select>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <GraduationCap className="mr-2 text-primary-600" />
            Eligibility Criteria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Min CGPA Required</label>
              <input type="number" step="0.01" {...register('eligibilityCgpa')} className="input" placeholder="7.5" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Eligible Departments</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Artificial Intelligence', 'Agriculture'].map(dept => (
                  <label key={dept} className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input 
                      type="checkbox" 
                      value={dept} 
                      {...register('eligibleDepartments', { required: 'Select at least one department' })}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-600"
                    />
                    <span>{dept}</span>
                  </label>
                ))}
              </div>
              {errors.eligibleDepartments && <p className="text-rose-500 text-xs mt-1">{errors.eligibleDepartments.message}</p>}
            </div>
          </div>
        </div>



        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Job Description</label>
          <textarea 
            {...register('description', { required: 'Description is required' })}
            className="input h-48 pt-2" 
            placeholder="Outline responsibilities, requirements, and benefits..." 
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary px-8 flex items-center space-x-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{isEditing ? 'Save Changes' : 'Post Opportunity'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
