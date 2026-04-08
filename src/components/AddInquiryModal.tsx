import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Inquiry, InquiryStatus } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (inquiry: Omit<Inquiry, 'srNo'>) => void;
}

export default function AddInquiryModal({ isOpen, onClose, onAdd }: Props) {
  const [formData, setFormData] = useState({
    id: '',
    equipment: '',
    client: '',
    noOfTag: 1,
    inputsRev: '',
    receivedDate: new Date().toISOString().split('T')[0],
    submissionDate: '',
    status: 'New' as InquiryStatus,
    remarks: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: `THT-${formData.id}`,
      date: new Date(formData.receivedDate).toISOString(), // Keep main date synced with received date
      receivedDate: new Date(formData.receivedDate).toISOString(),
      submissionDate: formData.submissionDate ? new Date(formData.submissionDate).toISOString() : undefined,
      invoiceRaised: false,
      paymentReceived: false,
      notes: []
    });
    setFormData({
      id: '',
      equipment: '',
      client: '',
      noOfTag: 1,
      inputsRev: '',
      receivedDate: new Date().toISOString().split('T')[0],
      submissionDate: '',
      status: 'New',
      remarks: '',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Add New Enquiry</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">THT Enquiry No.</label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <span className="px-3 py-2 bg-gray-100 text-gray-600 border-r border-gray-300 font-medium">THT-</span>
                    <input 
                      required 
                      type="text" 
                      value={formData.id} 
                      onChange={e => setFormData({...formData, id: e.target.value})} 
                      className="w-full p-2 outline-none" 
                      placeholder="2212" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input type="text" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Client Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                  <input 
                    type="text" 
                    list="equipment-list" 
                    value={formData.equipment} 
                    onChange={e => setFormData({...formData, equipment: e.target.value})} 
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Select or type..." 
                  />
                  <datalist id="equipment-list">
                    <option value="ACHE" />
                    <option value="STHE" />
                    <option value="FIRED Heater" />
                    <option value="Economizer" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. of TAG</label>
                  <input type="number" min="1" value={formData.noOfTag} onChange={e => setFormData({...formData, noOfTag: parseInt(e.target.value) || 0})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">INPUTS REV.</label>
                  <input type="text" value={formData.inputsRev} onChange={e => setFormData({...formData, inputsRev: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 2026-04-01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
                  <input type="date" value={formData.receivedDate} onChange={e => setFormData({...formData, receivedDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label>
                  <input type="date" value={formData.submissionDate} onChange={e => setFormData({...formData, submissionDate: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={2} placeholder="Any initial remarks..." />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Add Enquiry</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
