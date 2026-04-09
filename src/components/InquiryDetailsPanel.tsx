import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Wrench, Hash, Calendar, Clock, Send, FileText, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { Inquiry, InquiryStatus } from '../types';
import { StatusBadge } from './Badge';

interface Props {
  inquiry: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateInquiry: (id: string, updates: Partial<Inquiry>) => void;
  onAddNote: (id: string, noteText: string) => void;
  onDeleteInquiry: (id: string) => void;
}

export default function InquiryDetailsPanel({ inquiry, isOpen, onClose, onUpdateInquiry, onAddNote, onDeleteInquiry }: Props) {
  const [newNote, setNewNote] = useState('');
  const [remarks, setRemarks] = useState('');
  const [editData, setEditData] = useState<Partial<Inquiry>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (inquiry) {
      setRemarks(inquiry.remarks);
      setEditData(inquiry);
    }
  }, [inquiry]);

  if (!inquiry) return null;

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(inquiry.id, newNote);
      setNewNote('');
    }
  };

  const handleSaveRemarks = () => {
    if (remarks !== inquiry.remarks) {
      onUpdateInquiry(inquiry.id, { remarks });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDeleteInquiry(inquiry.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-blue-700">{inquiry.id}</h2>
                <StatusBadge status={inquiry.status} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Enquiry"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Status Actions */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['New', 'In Progress', 'Completed', 'In Order Stage'] as InquiryStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateInquiry(inquiry.id, { status })}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        inquiry.status === status
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Enquiry Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="w-32 text-gray-500">Client:</span>
                    <input 
                      type="text"
                      value={editData.client || ''}
                      onChange={(e) => setEditData({...editData, client: e.target.value})}
                      onBlur={() => onUpdateInquiry(inquiry.id, { client: editData.client })}
                      className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-colors py-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Wrench className="w-4 h-4 text-gray-400" />
                    <span className="w-32 text-gray-500">Equipment:</span>
                    <input 
                      type="text"
                      list="equipment-list-edit"
                      value={editData.equipment || ''}
                      onChange={(e) => setEditData({...editData, equipment: e.target.value})}
                      onBlur={() => onUpdateInquiry(inquiry.id, { equipment: editData.equipment })}
                      className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-colors py-1"
                    />
                    <datalist id="equipment-list-edit">
                      <option value="ACHE" />
                      <option value="STHE" />
                      <option value="FIRED Heater" />
                      <option value="Economizer" />
                    </datalist>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="w-32 text-gray-500">No. of TAG:</span>
                    <input 
                      type="number"
                      value={editData.noOfTag || ''}
                      onChange={(e) => setEditData({...editData, noOfTag: parseInt(e.target.value) || 0})}
                      onBlur={() => onUpdateInquiry(inquiry.id, { noOfTag: editData.noOfTag })}
                      className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-colors py-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="w-32 text-gray-500">Inputs Rev:</span>
                    <input 
                      type="text"
                      value={editData.inputsRev || ''}
                      onChange={(e) => setEditData({...editData, inputsRev: e.target.value})}
                      onBlur={() => onUpdateInquiry(inquiry.id, { inputsRev: editData.inputsRev })}
                      className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-colors py-1"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Dates</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="w-32 text-gray-500">Revision Date:</span>
                    <input 
                      type="date"
                      value={editData.revisionDate ? new Date(editData.revisionDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditData({...editData, revisionDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                      onBlur={() => onUpdateInquiry(inquiry.id, { revisionDate: editData.revisionDate })}
                      className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-colors py-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="w-32 text-gray-500">Received Date:</span>
                    <input 
                      type="date"
                      value={editData.receivedDate ? new Date(editData.receivedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditData({...editData, receivedDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                      onBlur={() => onUpdateInquiry(inquiry.id, { receivedDate: editData.receivedDate })}
                      className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-colors py-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className="w-32 text-gray-500">Submission Date:</span>
                    <input 
                      type="date"
                      value={editData.submissionDate ? new Date(editData.submissionDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditData({...editData, submissionDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                      onBlur={() => onUpdateInquiry(inquiry.id, { submissionDate: editData.submissionDate })}
                      className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-colors py-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="w-32 text-gray-500">Invoice Date:</span>
                    <input 
                      type="date"
                      value={editData.invoiceRaisedDate ? new Date(editData.invoiceRaisedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditData({...editData, invoiceRaisedDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                      onBlur={() => onUpdateInquiry(inquiry.id, { invoiceRaisedDate: editData.invoiceRaisedDate })}
                      className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-colors py-1"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="w-32 text-gray-500">Payment Date:</span>
                    <input 
                      type="date"
                      value={editData.paymentReceivedDate ? new Date(editData.paymentReceivedDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditData({...editData, paymentReceivedDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                      onBlur={() => onUpdateInquiry(inquiry.id, { paymentReceivedDate: editData.paymentReceivedDate })}
                      className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full transition-colors py-1"
                    />
                  </div>
                </div>
              </div>

              {/* Financials / Toggles */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Billing Status</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => onUpdateInquiry(inquiry.id, { invoiceRaised: !inquiry.invoiceRaised })}
                    className="flex items-center gap-3 w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                  >
                    {inquiry.invoiceRaised ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                    <span className="text-sm font-medium text-gray-700">Invoice Raised</span>
                  </button>
                  <button 
                    onClick={() => onUpdateInquiry(inquiry.id, { paymentReceived: !inquiry.paymentReceived })}
                    className="flex items-center gap-3 w-full p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                  >
                    {inquiry.paymentReceived ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                    <span className="text-sm font-medium text-gray-700">Payment Received</span>
                  </button>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Remarks</h3>
                <div className="space-y-2">
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    onBlur={handleSaveRemarks}
                    placeholder="Add remarks..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Internal Notes</h3>
                <div className="space-y-4">
                  {inquiry.notes.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">No internal notes yet.</div>
                  ) : (
                    inquiry.notes.map((note) => (
                      <div key={note.id} className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-yellow-800">{note.author}</span>
                          <span className="text-xs text-yellow-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(note.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{note.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Add Note Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add an internal note..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Custom Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Enquiry?</h3>
                  <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this enquiry? This action cannot be undone.</p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      No
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
