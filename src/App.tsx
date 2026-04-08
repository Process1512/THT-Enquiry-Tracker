/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Inbox, Clock, CheckCircle, Search, Filter, LayoutDashboard, Check, X, Plus, FileSpreadsheet, FileText, Upload, LogOut } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Inquiry, InquiryStatus } from './types';
import { StatusBadge } from './components/Badge';
import InquiryDetailsPanel from './components/InquiryDetailsPanel';
import AddInquiryModal from './components/AddInquiryModal';
import { db, auth, signInWithGoogle, logOut } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'All'>('All');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const unsubscribe = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      const inquiriesData: Inquiry[] = [];
      snapshot.forEach((doc) => {
        inquiriesData.push({ id: doc.id, ...doc.data() } as Inquiry);
      });
      setInquiries(inquiriesData);
    }, (error) => {
      console.error("Firestore Error: ", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleUpdateInquiry = async (id: string, updates: Partial<Inquiry>) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'inquiries', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating inquiry", error);
      alert("Failed to update inquiry.");
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      if (selectedInquiryId === id) setSelectedInquiryId(null);
    } catch (error) {
      console.error("Error deleting inquiry", error);
      alert("Failed to delete inquiry.");
    }
  };

  const handleCreateInquiry = async (newInquiryData: Omit<Inquiry, 'srNo'>) => {
    if (!user) return;
    const newSrNo = inquiries.length > 0 ? Math.max(...inquiries.map(i => i.srNo)) + 1 : 1;
    const newInquiry: Inquiry = {
      ...newInquiryData,
      srNo: newSrNo
    };
    try {
      await setDoc(doc(db, 'inquiries', newInquiry.id), newInquiry);
    } catch (error) {
      console.error("Error creating inquiry", error);
      alert("Failed to create inquiry.");
    }
  };

  const handleAddNote = async (id: string, text: string) => {
    if (!user) return;
    const inquiry = inquiries.find(i => i.id === id);
    if (!inquiry) return;

    const newNote = {
      id: `n${Date.now()}`,
      text,
      date: new Date().toISOString(),
      author: user.displayName || user.email || 'Current User'
    };

    try {
      const docRef = doc(db, 'inquiries', id);
      await updateDoc(docRef, {
        notes: [...inquiry.notes, newNote]
      });
    } catch (error) {
      console.error("Error adding note", error);
      alert("Failed to add note.");
    }
  };

  const filteredInquiries = useMemo(() => {
    const filtered = inquiries.filter(inq => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (inq.client?.toLowerCase() || '').includes(searchLower) ||
        (inq.equipment?.toLowerCase() || '').includes(searchLower) ||
        (inq.id?.toLowerCase() || '').includes(searchLower);
      
      const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort by THT Enquiry No (lowest first)
    return filtered.sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''));
      const numB = parseInt(b.id.replace(/\D/g, ''));
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.id.localeCompare(b.id);
    });
  }, [inquiries, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: inquiries.length,
      new: inquiries.filter(i => i.status === 'New').length,
      inProgress: inquiries.filter(i => i.status === 'In Progress').length,
      resolved: inquiries.filter(i => i.status === 'Resolved').length,
    };
  }, [inquiries]);

  const selectedInquiry = useMemo(() => 
    inquiries.find(i => i.id === selectedInquiryId) || null
  , [inquiries, selectedInquiryId]);

  const exportToExcel = () => {
    const wsData = [
      ["THT Enquiry Tracker Summary"],
      ["Total Enquiries", "New", "In Progress", "Resolved"],
      [stats.total, stats.new, stats.inProgress, stats.resolved],
      [],
      ["Detailed Enquiries List"],
      ["Sr. No.", "THT Enquiry No.", "Equipment", "Client", "No. of TAG", "INPUTS REV.", "RECEIVED DATE", "SUBMITTED DATE", "STATUS", "Remarks", "Invoice Raised", "Payment Received"]
    ];

    filteredInquiries.forEach((inq, index) => {
      wsData.push([
        index + 1,
        inq.id,
        inq.equipment,
        inq.client,
        inq.noOfTag,
        inq.inputsRev,
        inq.receivedDate ? new Date(inq.receivedDate).toLocaleDateString() : '-',
        inq.submissionDate ? new Date(inq.submissionDate).toLocaleDateString() : '-',
        inq.status,
        inq.remarks,
        inq.invoiceRaised ? 'Yes' : 'No',
        inq.paymentReceived ? 'Yes' : 'No'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add some basic styling/merging for the summary
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Merge title
      { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } }  // Merge list title
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries");
    XLSX.writeFile(wb, "THT_Enquiries.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text("THT Enquiry Tracker Report", 14, 15);

    // Add Summary Table
    autoTable(doc, {
      head: [["Total Enquiries", "New", "In Progress", "Resolved"]],
      body: [[stats.total, stats.new, stats.inProgress, stats.resolved]],
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], halign: 'center' },
      bodyStyles: { halign: 'center', fontStyle: 'bold', fontSize: 12 },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 20;
    doc.text("Detailed Enquiries List", 14, finalY + 10);

    const tableColumn = ["Sr. No.", "THT No.", "Equipment", "Client", "TAGs", "REV.", "Received", "Submitted", "Status", "Remarks", "Invoice", "Payment"];
    const tableRows = filteredInquiries.map((inq, index) => [
      index + 1,
      inq.id,
      inq.equipment,
      inq.client,
      inq.noOfTag,
      inq.inputsRev,
      inq.receivedDate ? new Date(inq.receivedDate).toLocaleDateString() : '-',
      inq.submissionDate ? new Date(inq.submissionDate).toLocaleDateString() : '-',
      inq.status,
      inq.remarks,
      inq.invoiceRaised ? 'Yes' : 'No',
      inq.paymentReceived ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: finalY + 15,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [155, 194, 230], textColor: [0, 0, 0] }
    });

    doc.save("THT_Enquiries.pdf");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const ab = evt.target?.result;
        const wb = XLSX.read(ab, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Use raw: false to get formatted strings for dates if possible
        const data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }) as any[][];

        let headerRowIndex = -1;
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          if (row && Array.isArray(row) && row.length >= 3) {
            const rowStr = row.map(String).join(' ').toLowerCase();
            const matchCount = ['tht', 'enquiry', 'client', 'equipment', 'status', 'tag', 'remark', 'date'].filter(kw => rowStr.includes(kw)).length;
            // If we find at least 2 matching keywords in a row with multiple columns, it's our header
            if (matchCount >= 2) {
              headerRowIndex = i;
              break;
            }
          }
        }

        if (headerRowIndex === -1) {
          alert("Could not find valid headers in the Excel file. Please ensure there are columns like 'THT No', 'Client', or 'Equipment'.");
          return;
        }

        const headers = data[headerRowIndex].map(h => String(h || '').toLowerCase().trim());
        const rows = data.slice(headerRowIndex + 1);

        const newInquiries: Inquiry[] = [];
        
        rows.forEach((row) => {
          if (!row || row.length === 0) return;
          
          const getVal = (keywords: string[]) => {
            const colIdx = headers.findIndex(h => keywords.some(kw => h.includes(kw)));
            return colIdx !== -1 ? row[colIdx] : undefined;
          };

          let idVal = getVal(['tht', 'enquiry no', 'enquiry id', 'id']);
          // Fallback if they just named it "No" or "Number" but not "Sr. No"
          if (!idVal) {
             const fallbackIdx = headers.findIndex(h => (h.includes('no') || h.includes('num')) && !h.includes('sr') && !h.includes('tag'));
             if (fallbackIdx !== -1) idVal = row[fallbackIdx];
          }

          if (!idVal || String(idVal).trim() === '') return; // Skip empty rows
          
          let finalId = String(idVal).trim();
          if (!finalId.toUpperCase().startsWith('THT-')) {
              finalId = `THT-${finalId}`;
          } else {
              finalId = finalId.toUpperCase();
          }

          const equipment = getVal(['equipment', 'item', 'desc']) || '';
          const client = getVal(['client', 'customer', 'company']) || '';
          const noOfTag = parseInt(String(getVal(['tag', 'qty', 'quantity']) || '1'), 10) || 1;
          const inputsRev = getVal(['rev', 'input']) || '';
          
          const parseDate = (val: any) => {
            if (!val || String(val).trim() === '-' || String(val).trim() === '') return undefined;
            
            let d = new Date(val);
            if (isNaN(d.getTime()) && typeof val === 'string') {
               const parts = val.split(/[-/.]/);
               if (parts.length === 3) {
                  // Try DD/MM/YYYY
                  d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
               }
            }
            return isNaN(d.getTime()) ? undefined : d.toISOString();
          };

          const receivedDate = parseDate(getVal(['received', 'recv', 'date']));
          const submissionDate = parseDate(getVal(['submit', 'subm']));
          
          const statusRaw = String(getVal(['status', 'state']) || 'New').trim();
          let status: InquiryStatus = 'New';
          if (/progress/i.test(statusRaw)) status = 'In Progress';
          else if (/resolve/i.test(statusRaw)) status = 'Resolved';
          else if (/close/i.test(statusRaw)) status = 'Closed';
          
          const remarks = getVal(['remark', 'note', 'comment']) || '';
          
          const invRaw = String(getVal(['invoice', 'inv']) || '').toLowerCase().trim();
          const invoiceRaised = invRaw === 'yes' || invRaw === 'true' || invRaw === '1' || invRaw === 'y';
          
          const payRaw = String(getVal(['payment', 'pay']) || '').toLowerCase().trim();
          const paymentReceived = payRaw === 'yes' || payRaw === 'true' || payRaw === '1' || payRaw === 'y';

          newInquiries.push({
            id: finalId,
            srNo: 0, // placeholder
            equipment: String(equipment),
            client: String(client),
            noOfTag,
            inputsRev: String(inputsRev),
            date: receivedDate || new Date().toISOString(),
            receivedDate,
            submissionDate,
            status,
            remarks: String(remarks),
            invoiceRaised,
            paymentReceived,
            notes: []
          });
        });

        if (newInquiries.length === 0) {
           alert("No valid data rows found to import. Please check if the 'THT Enquiry No.' column exists and has data.");
           return;
        }

        const importData = async () => {
          if (!user) return;
          try {
            const batch = writeBatch(db);
            let addedCount = 0;
            let updatedCount = 0;
            let maxSrNo = inquiries.reduce((max, inq) => Math.max(max, inq.srNo || 0), 0);

            newInquiries.forEach(newInq => {
              const existingInq = inquiries.find(i => i.id === newInq.id);
              const docRef = doc(db, 'inquiries', newInq.id);
              
              if (existingInq) {
                batch.update(docRef, {
                  ...newInq,
                  srNo: existingInq.srNo,
                  notes: existingInq.notes
                });
                updatedCount++;
              } else {
                maxSrNo++;
                batch.set(docRef, {
                  ...newInq,
                  srNo: maxSrNo
                });
                addedCount++;
              }
            });

            await batch.commit();
            alert(`Import successful!\nAdded: ${addedCount} new enquiries\nUpdated: ${updatedCount} existing enquiries`);
          } catch (error) {
            console.error("Error committing batch:", error);
            alert("Error importing data to database.");
          }
        };

        importData();
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Error parsing Excel file. Please check the format.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">THT Enquiry Tracker</h1>
          <p className="text-gray-500 mb-8">Sign in to view and manage enquiries collaboratively.</p>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">THT Enquiry Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.displayName || user.email}</span>
            </div>
            <button
              onClick={logOut}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Enquiries" value={stats.total} icon={<Inbox className="w-5 h-5 text-blue-600" />} bgClass="bg-blue-50" />
          <StatCard title="New" value={stats.new} icon={<CheckCircle className="w-5 h-5 text-amber-600" />} bgClass="bg-amber-50" />
          <StatCard title="In Progress" value={stats.inProgress} icon={<Clock className="w-5 h-5 text-purple-600" />} bgClass="bg-purple-50" />
          <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle className="w-5 h-5 text-green-600" />} bgClass="bg-green-50" />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by THT No, Client, or Equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-end">
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportExcel} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-amber-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-amber-700 transition-colors text-sm font-medium whitespace-nowrap"
              title="Import from Excel"
            >
              <Upload className="w-4 h-4" /> Import Excel
            </button>
            <button 
              onClick={exportToExcel}
              className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
              title="Export to Excel"
            >
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button 
              onClick={exportToPDF}
              className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap"
              title="Export to PDF"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Enquiry
            </button>
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#9bc2e6]">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">Sr. No.</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">THT Enquiry No.</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">Equipment</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">Client</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">No. of TAG</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">INPUTS REV.</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">RECEIVED DATE</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">SUBMITTED DATE</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">STATUS</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">Remarks</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider border-r border-gray-300">Invoice Raised</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">Payment Received</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                      No enquiries found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry, index) => (
                    <tr 
                      key={inquiry.id} 
                      onClick={() => setSelectedInquiryId(inquiry.id)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 text-center">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 border-r border-gray-100">{inquiry.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100">{inquiry.equipment}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100">{inquiry.client}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 text-center">{inquiry.noOfTag}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100">{inquiry.inputsRev}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">{inquiry.receivedDate ? new Date(inquiry.receivedDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">{inquiry.submissionDate ? new Date(inquiry.submissionDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-100"><StatusBadge status={inquiry.status} /></td>
                      <td className="px-4 py-3 text-sm text-gray-500 border-r border-gray-100 max-w-[200px] truncate">{inquiry.remarks}</td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-gray-100 text-center">
                        {inquiry.invoiceRaised ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {inquiry.paymentReceived ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <InquiryDetailsPanel 
        inquiry={selectedInquiry}
        isOpen={!!selectedInquiryId}
        onClose={() => setSelectedInquiryId(null)}
        onUpdateInquiry={handleUpdateInquiry}
        onAddNote={handleAddNote}
        onDeleteInquiry={handleDeleteInquiry}
      />

      <AddInquiryModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleCreateInquiry}
      />
    </div>
  );
}

function StatCard({ title, value, icon, bgClass }: { title: string, value: number, icon: React.ReactNode, bgClass: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bgClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

