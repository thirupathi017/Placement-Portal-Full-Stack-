import React, { useEffect, useState } from 'react';
import { Download, Search, CheckCircle, Building2, User, Loader2 } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const PlacementsReport = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const res = await axiosInstance.get('/api/admin/placements');
        setPlacements(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlacements();
  }, []);

  // Group placements by department
  const groupedPlacements = placements.reduce((acc, p) => {
    const deptName = p.department || 'Other / Not Specified';
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(p);
    return acc;
  }, {});

  const departmentNames = Object.keys(groupedPlacements).sort();

  const handleExport = async () => {
    if (placements.length === 0) return;
    
    const tableHeader = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Student Name", bold: true, color: "ffffff" })] })], backgroundColor: "10b981" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Roll Number", bold: true, color: "ffffff" })] })], backgroundColor: "10b981" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Company", bold: true, color: "ffffff" })] })], backgroundColor: "10b981" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Job Role", bold: true, color: "ffffff" })] })], backgroundColor: "10b981" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Package", bold: true, color: "ffffff" })] })], backgroundColor: "10b981" }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Date", bold: true, color: "ffffff" })] })], backgroundColor: "10b981" }),
      ],
    });

    const tableRows = placements.map(p => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(p.studentName)] }),
        new TableCell({ children: [new Paragraph(p.rollNumber)] }),
        new TableCell({ children: [new Paragraph(p.companyName)] }),
        new TableCell({ children: [new Paragraph(p.jobTitle)] }),
        new TableCell({ children: [new Paragraph(`${p.packageLpa} LPA`)] }),
        new TableCell({ children: [new Paragraph(new Date(p.appliedAt).toLocaleDateString())] }),
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
            children: [new TextRun({ text: "Final Placement Report", bold: true, size: 40, color: "10b981" })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [new TextRun({ text: `Generated on: ${new Date().toLocaleString()}`, size: 20, color: "666666" })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [new TextRun({ text: `Total Placements: ${placements.length}`, size: 20, color: "666666" })],
            spacing: { after: 400 }
          }),
          table,
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `placements_report_${new Date().toISOString().split('T')[0]}.docx`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Placement Report</h1>
          <p className="text-slate-500">Full list of selected candidates and their offers</p>
        </div>
        <button 
          onClick={handleExport}
          className="btn btn-primary flex items-center space-x-2"
          disabled={placements.length === 0}
        >
          <Download size={20} />
          <span>Export Placement Data</span>
        </button>
      </header>

      <div className="space-y-8">
        {loading ? (
          <div className="card p-12 flex justify-center">
            <Loader2 className="animate-spin text-primary-600" size={40} />
          </div>
        ) : departmentNames.length > 0 ? (
          departmentNames.map(dept => (
            <div key={dept} className="space-y-4">
              <h2 className="text-xl font-bold flex items-center text-slate-700 dark:text-slate-200">
                <div className="w-2 h-6 bg-primary-600 rounded mr-3"></div>
                {dept}
                <span className="ml-3 text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {groupedPlacements[dept].length} Placements
                </span>
              </h2>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Student</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">College</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Company</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Job Role</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Package</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Date Selected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {groupedPlacements[dept].map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                              <User size={18} />
                            </div>
                            <div>
                              <div className="font-bold">{p.studentName}</div>
                              <div className="text-xs text-slate-500">{p.rollNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {p.college}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Building2 size={16} className="text-slate-400" />
                            <span className="font-medium">{p.companyName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{p.jobTitle}</td>
                        <td className="px-6 py-4">
                          <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold inline-block">
                            {p.packageLpa} LPA
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(p.appliedAt).toLocaleDateString()}
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
          <div className="card p-20 text-center">
            <CheckCircle size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500">No placements recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementsReport;
