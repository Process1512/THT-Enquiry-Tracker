export type InquiryStatus = 'New' | 'In Progress' | 'Completed' | 'In Order Stage';

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
  revisionDate?: string;
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
