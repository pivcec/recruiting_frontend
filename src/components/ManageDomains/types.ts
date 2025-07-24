// components/ManageDomains/types.ts

export type Exam = {
  id: number;
  code: string;
  name: string;
  category: string;
};

export type SelectedExam = {
  examCategory: string;
  examScope: string;
  latestExamDate: string;
};

export type ResultItem = {
  firm_id: number;
  firm_name: string;
  profile_count: number;
  email_guess_count: number;
  verified_email_guess_count: number;
};

export type Domain = {
  id: number;
  domain: string;
};

export type FirmWithDomains = {
  [firmId: number]: Domain[];
};

export type ProfileResultItem = {
  id: number;
  full_name: string;
};

export type ProfilesByDomain = {
  [domainId: number]: ProfileResultItem[];
};
