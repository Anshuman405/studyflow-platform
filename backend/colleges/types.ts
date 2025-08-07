export interface College {
  id: number;
  name: string;
  location?: string;
  acceptanceRate?: number;
  avgGpa?: number;
  avgSat?: number;
  avgAct?: number;
  details: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollegeRequest {
  name: string;
  location?: string;
  acceptanceRate?: number;
  avgGpa?: number;
  avgSat?: number;
  avgAct?: number;
  details?: Record<string, any>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchCollegesResponse {
  colleges: College[];
  pagination?: PaginationInfo;
}

export interface AdmissionChanceRequest {
  collegeId: number;
  gpa: number;
  sat?: number;
  act?: number;
  extracurriculars?: number; // 1-10 scale
  essays?: number; // 1-10 scale
}

export interface AdmissionChanceResponse {
  chance: number; // 0-100 percentage
  recommendations: string[];
}
