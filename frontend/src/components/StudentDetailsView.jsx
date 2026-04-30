import React from 'react';
import { 
  User, Mail, Phone, BookOpen, GraduationCap, 
  Calendar, Award, Code, FileText, ExternalLink,
  CheckCircle, AlertCircle, Star
} from 'lucide-react';

const StudentDetailsView = ({ data }) => {
  // Safety check for null/undefined data
  if (!data) {
    return (
      <div className="card p-12 text-center">
        <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
        <p className="text-slate-500 font-medium">No student details available to display.</p>
      </div>
    );
  }

  // Safely parse skills
  const getSkills = () => {
    if (!data.skills) return [];
    if (Array.isArray(data.skills)) return data.skills;
    if (typeof data.skills === 'string') {
      return data.skills.split(',').map(s => s.trim()).filter(s => s !== '');
    }
    return [];
  };

  const skills = getSkills();

  // Safely format resume URL
  const getResumeUrl = () => {
    if (!data.resumeUrl) return null;
    if (data.resumeUrl.startsWith('http')) return data.resumeUrl;
    return `http://localhost:8080${data.resumeUrl.startsWith('/') ? '' : '/'}${data.resumeUrl}`;
  };

  const resumeUrl = getResumeUrl();

  return (
    <div className="space-y-8">
      {/* Header Profile Card */}
      <div className="card overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <div className="h-32 bg-primary-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 p-1 shadow-lg">
              <div className="w-full h-full rounded-[20px] bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                <User size={48} />
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 right-8">
             <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border-2 ${
                data.placed 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {data.placed ? 'Placed' : 'Seeking Opportunities'}
              </span>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">{data.name || 'Student Name'}</h2>
              <p className="text-primary-600 font-bold tracking-wide uppercase text-sm mt-1">{data.rollNumber || 'No Roll Number'}</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-xl text-sm">
                <Mail size={16} className="mr-2 text-primary-500" />
                {data.email || 'No email provided'}
              </div>
              <div className="flex items-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-2 rounded-xl text-sm">
                <Phone size={16} className="mr-2 text-primary-500" />
                {data.phone || 'No phone provided'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Academic Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center text-slate-800 dark:text-white">
              <BookOpen className="mr-3 text-primary-600" />
              Academic Background
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</p>
                <div className="flex items-center">
                  <GraduationCap size={20} className="mr-2 text-slate-400" />
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{data.department || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">College / Institution</p>
                <div className="flex items-center">
                  <Award size={20} className="mr-2 text-slate-400" />
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{data.college || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Batch Year</p>
                <div className="flex items-center">
                  <Calendar size={20} className="mr-2 text-slate-400" />
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{data.batchYear || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current CGPA</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-black mr-3">
                    {data.cgpa || '0.0'}
                  </div>
                  <p className="text-sm font-medium text-slate-500">Academic Standing: {data.cgpa > 8.0 ? 'Excellent' : 'Good'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center text-slate-800 dark:text-white">
              <Code className="mr-3 text-primary-600" />
              Technical Skills
            </h3>
            
            <div className="flex flex-wrap gap-3">
              {skills.length > 0 ? skills.map((skill, index) => (
                <span 
                  key={index}
                  className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-xl text-sm font-bold border border-primary-100 dark:border-primary-900/30"
                >
                  {skill}
                </span>
              )) : (
                <p className="text-slate-500 italic text-sm">No skills listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Resume & Status */}
        <div className="space-y-8">
          <div className="card p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
            
            <h3 className="text-xl font-bold mb-6 flex items-center text-slate-800 dark:text-white">
              <FileText className="mr-3 text-primary-600" />
              Resume
            </h3>
            
            {resumeUrl ? (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[150px]">Resume_Document.pdf</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">PDF Document</p>
                    </div>
                  </div>
                  
                  <a 
                    href={resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full py-3 flex items-center justify-center group"
                  >
                    <span>View Resume</span>
                    <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm font-medium">No resume uploaded.</p>
              </div>
            )}
          </div>

          <div className={`card p-8 border-none ${data.placed ? 'bg-emerald-600' : 'bg-primary-600'} text-white shadow-lg shadow-primary-600/20`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center">
                <Star className="mr-3" />
                Status
              </h3>
              {data.placed && <CheckCircle size={24} />}
            </div>
            
            <p className="text-white/80 font-medium leading-relaxed">
              {data.placed 
                ? "This student has successfully secured a placement and is no longer appearing in the active applicant pool for new jobs." 
                : "This student is actively participating in recruitment drives and is eligible for all matching job opportunities."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsView;
