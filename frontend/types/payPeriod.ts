export interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  timesheets: {
    id: string;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
}

export interface CreatePayPeriodInput {
  startDate: string;
  endDate: string;
} 