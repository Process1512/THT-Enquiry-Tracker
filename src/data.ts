import { Inquiry } from './types';

export const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: 'THT-2226',
    srNo: 1,
    equipment: 'ACHE',
    client: 'BOILEN',
    noOfTag: 6,
    inputsRev: 'REV.0',
    date: '2026-01-01T00:00:00Z',
    receivedDate: '2026-01-01T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT HTRI & BOQ | SENT 2 TAGS',
    invoiceRaised: false,
    paymentReceived: false,
    notes: [
      { id: 'n1', text: 'REV.0 - SENT HTRI & BOQ | SENT 3 TAGS', date: '2025-12-18T00:00:00Z', author: 'System' }
    ]
  },
  {
    id: 'THT-2228',
    srNo: 2,
    equipment: 'ACHE',
    client: 'AKSHAR',
    noOfTag: 1,
    inputsRev: 'REV.2',
    date: '2026-02-19T00:00:00Z',
    receivedDate: '2026-02-19T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT HTRI & BOQ',
    invoiceRaised: false,
    paymentReceived: false,
    notes: [
      { id: 'n2', text: 'REV.0 - SENT HTRI & BOQ', date: '2025-12-20T00:00:00Z', author: 'System' },
      { id: 'n3', text: 'REV.1 - SENT HTRI & BOQ', date: '2026-01-23T00:00:00Z', author: 'System' }
    ]
  },
  {
    id: 'THT-2229',
    srNo: 3,
    equipment: 'ACHE',
    client: 'ARAMCO',
    noOfTag: 2,
    inputsRev: 'REV.0',
    date: '2025-12-23T00:00:00Z',
    receivedDate: '2025-12-23T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT REPORT | MOORE FAN REPORT',
    invoiceRaised: false,
    paymentReceived: false,
    notes: [
      { id: 'n4', text: 'REV.0 - SENT HTRI & BOQ | MECHANICAL REPORT & STRUCTURE WEIGHT & UG 44 CHECK', date: '2025-12-20T00:00:00Z', author: 'System' }
    ]
  },
  {
    id: 'THT-2232',
    srNo: 4,
    equipment: 'ACHE',
    client: 'AKSHAR',
    noOfTag: 1,
    inputsRev: 'REV.0',
    date: '2026-01-09T00:00:00Z',
    receivedDate: '2026-01-09T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT HTRI & BOQ | MECHANICAL REPORT',
    invoiceRaised: false,
    paymentReceived: false,
    notes: []
  },
  {
    id: 'THT-2234',
    srNo: 5,
    equipment: 'STHE',
    client: 'BEVPL',
    noOfTag: 2,
    inputsRev: 'REV.0',
    date: '2026-01-20T00:00:00Z',
    receivedDate: '2026-01-20T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT HTRI',
    invoiceRaised: false,
    paymentReceived: false,
    notes: []
  },
  {
    id: 'THT-2236',
    srNo: 6,
    equipment: 'ACHE',
    client: 'AKSHAR',
    noOfTag: 8,
    inputsRev: 'REV.0',
    date: '2026-02-04T00:00:00Z',
    receivedDate: '2026-02-04T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT HTRI & BOQ',
    invoiceRaised: false,
    paymentReceived: false,
    notes: []
  },
  {
    id: 'THT-2239',
    srNo: 7,
    equipment: 'STHE',
    client: 'EXPRESS',
    noOfTag: 1,
    inputsRev: 'REV.2',
    date: '2026-02-27T00:00:00Z',
    receivedDate: '2026-02-27T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT HTRI',
    invoiceRaised: false,
    paymentReceived: false,
    notes: [
      { id: 'n5', text: 'REV.0 - SENT HTRI', date: '2026-02-18T00:00:00Z', author: 'System' },
      { id: 'n6', text: 'REV.1 - SENT HTRI', date: '2026-02-24T00:00:00Z', author: 'System' }
    ]
  },
  {
    id: 'THT-2244',
    srNo: 8,
    equipment: 'ACHE',
    client: 'AKSHAR',
    noOfTag: 16,
    inputsRev: 'REV.0',
    date: '2026-03-26T00:00:00Z',
    receivedDate: '2026-03-26T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT HTRI & BOQ | MECHANICAL REPORT',
    invoiceRaised: false,
    paymentReceived: false,
    notes: []
  },
  {
    id: 'THT-2245',
    srNo: 9,
    equipment: 'STHE',
    client: 'OCS',
    noOfTag: 2,
    inputsRev: 'REV.0',
    date: '2026-03-27T00:00:00Z',
    receivedDate: '2026-03-27T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT HTRI',
    invoiceRaised: false,
    paymentReceived: false,
    notes: []
  },
  {
    id: 'THT-2246',
    srNo: 10,
    equipment: 'STHE',
    client: 'BEVPL',
    noOfTag: 1,
    inputsRev: 'REV.0',
    date: '2026-04-01T00:00:00Z',
    receivedDate: '2026-04-01T00:00:00Z',
    status: 'In Progress',
    remarks: 'SENT HTRI',
    invoiceRaised: false,
    paymentReceived: false,
    notes: []
  },
  {
    id: 'THT-2247',
    srNo: 11,
    equipment: 'STHE',
    client: 'OCS',
    noOfTag: 2,
    inputsRev: 'REV.0',
    date: new Date().toISOString(),
    receivedDate: new Date().toISOString(),
    status: 'New',
    remarks: '',
    invoiceRaised: false,
    paymentReceived: false,
    notes: []
  }
];
