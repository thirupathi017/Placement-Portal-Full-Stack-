import React, { useState } from 'react';
import { Upload, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const ResumeUploader = ({ onUploadSuccess, initialUrl, readOnly = false }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (readOnly) return;
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || readOnly) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post('/api/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      onUploadSuccess(response.data.url);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 ${
        file ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20' : 'border-slate-300 dark:border-slate-700'
      } ${readOnly ? 'opacity-75' : ''}`}>
        <input
          type="file"
          id="resume-upload"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={readOnly}
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <FileCheck size={48} className="text-primary-600 mb-2" />
            <p className="font-medium">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            {!readOnly && (
              <button 
                onClick={() => setFile(null)}
                className="mt-2 text-rose-500 text-xs font-bold uppercase hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <label htmlFor={readOnly ? "" : "resume-upload"} className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} flex flex-col items-center`}>
            <Upload size={48} className="text-slate-400 mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-200">
              {readOnly ? 'Resume Document' : 'Click to upload resume'}
            </p>
            {!readOnly && <p className="text-sm text-slate-500 mt-1">PDF format only, max 5MB</p>}
            {readOnly && !initialUrl && <p className="text-sm text-slate-500 mt-1">No resume uploaded yet</p>}
          </label>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 p-3 rounded-lg flex items-center text-sm">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 p-3 rounded-lg flex items-center text-sm">
          <FileCheck size={18} className="mr-2" />
          Resume uploaded successfully!
        </div>
      )}

      {!readOnly && (
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn btn-primary w-full flex items-center justify-center space-x-2"
        >
          {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
          <span>{uploading ? 'Uploading...' : 'Confirm Upload'}</span>
        </button>
      )}

      {initialUrl && (
        <p className="text-center text-xs text-slate-500">
          Currently using: <a href={initialUrl?.startsWith('http') ? initialUrl : `http://localhost:8080${initialUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View Current Resume</a>
        </p>
      )}
    </div>
  );
};

export default ResumeUploader;
