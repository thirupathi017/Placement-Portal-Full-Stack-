import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, User, CheckCircle, XCircle, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axiosInstance.get('/api/admin/students');
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.college && s.college.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group students by department
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    const deptName = student.department || 'Other / Not Specified';
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(student);
    return acc;
  }, {});

  const departmentNames = Object.keys(groupedStudents).sort();

  const handleExport = async () => {
    if (students.length === 0) return;
    
    const tableHeader = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true, color: "ffffff" })] })], backgroundColor: "0ea5e9" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Roll Number", bold: true, color: "ffffff" })] })], backgroundColor: "0ea5e9" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Department", bold: true, color: "ffffff" })] })], backgroundColor: "0ea5e9" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CGPA", bold: true, color: "ffffff" })] })], backgroundColor: "0ea5e9" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Batch", bold: true, color: "ffffff" })] })], backgroundColor: "0ea5e9" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true, color: "ffffff" })] })], backgroundColor: "0ea5e9" }),
      ],
    });

    const tableRows = students.map(s => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.name || '' })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.rollNumber || '' })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.department || 'N/A' })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(s.cgpa || 'N/A') })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(s.batchYear || 'N/A') })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: s.placed ? 'PLACED' : 'UNPLACED' })] })] }),
      ],
    }));

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [tableHeader, ...tableRows],
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Student Management Report", bold: true, size: 40, color: "0ea5e9" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: `Generated on: ${new Date().toLocaleString()}`, size: 20, color: "666666" })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: `Total Students: ${students.length}`, size: 20, color: "666666" })],
            spacing: { after: 400 }
          }),
          table,
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `students_report_${new Date().toISOString().split('T')[0]}.docx`);
  };

  const handleVerifyStudent = async (id) => {
    try {
      console.log(`Verifying student with ID: ${id}`);
      const res = await axiosInstance.put(`/api/admin/students/${id}/verify`);
      const updatedStudent = res.data;
      
      setStudents(prevStudents => 
        prevStudents.map(s => s.id === id ? { ...s, verified: true } : s)
      );
      
      console.log(`Student ${id} verified successfully`);
    } catch (err) {
      console.error('Verification error details:', err.response || err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to verify student. Please check the console for details.';
      alert(`Verification Failed: ${errorMsg}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-slate-500">Monitor and manage all student placement records</p>
        </div>
        <button 
          onClick={handleExport}
          className="btn btn-secondary flex items-center space-x-2"
          disabled={students.length === 0}
        >
          <Download size={18} />
          <span>Export All Data</span>
        </button>
      </header>

      <div className="card p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button className="btn btn-outline flex items-center space-x-2 w-full">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="card p-8 flex justify-center">
            <Loader2 className="animate-spin text-primary-600" size={40} />
          </div>
        ) : departmentNames.length > 0 ? (
          departmentNames.map(dept => (
            <div key={dept} className="space-y-4">
              <h2 className="text-xl font-bold flex items-center text-slate-700 dark:text-slate-200">
                <div className="w-2 h-6 bg-primary-600 rounded mr-3"></div>
                {dept}
                <span className="ml-3 text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {groupedStudents[dept].length} Students
                </span>
              </h2>
              
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Student</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Academic Info</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Placement</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Verification</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {groupedStudents[dept].map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                              <User size={20} />
                            </div>
                            <div>
                              <div className="font-bold">{student.name}</div>
                              <div className="text-xs text-slate-500">{student.rollNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{student.college}</div>
                          <div className="text-xs text-slate-500">CGPA: {student.cgpa} | Batch: {student.batchYear}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>{student.email}</div>
                          <div className="text-slate-500">{student.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            student.placed 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {student.placed ? 'PLACED' : 'UNPLACED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {student.verified ? (
                            <span className="flex items-center justify-center text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <ShieldCheck size={12} className="mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center justify-center text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              <ShieldAlert size={12} className="mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <Link 
                              to={`/admin/students/${student.id}`}
                              className="text-primary-600 font-bold text-xs hover:underline"
                            >
                              View Profile
                            </Link>
                            {!student.verified && (
                              <button 
                                onClick={() => handleVerifyStudent(student.id)}
                                className="text-emerald-600 font-bold text-xs hover:underline flex items-center"
                              >
                                <CheckCircle size={12} className="mr-1" />
                                Verify
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-12 text-center">
            <p className="text-slate-500">No students found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
