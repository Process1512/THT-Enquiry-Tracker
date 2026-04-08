export type InquiryStatus = 'New' | 'In Progress' | 'Resolved' | 'Closed';

export interface Note {
  id: string;
  text: string;
  date: string;
  author: string;
}

export interface Inquiry {
  id: string; // Maps to THT Enquiry No.
  srNo: number;
  equipment: string;
  client: string;
  noOfTag: number;
  inputsRev: string;
  date: string; // This is the main date shown on the dashboard
  receivedDate?: string;
  submissionDate?: string;
  invoiceRaisedDate?: string;
  paymentReceivedDate?: string;
  status: InquiryStatus;
  remarks: string;
  invoiceRaised: boolean;
  paymentReceived: boolean;
  notes: Note[];
}
