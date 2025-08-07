export type MaterialType = "pdf" | "doc" | "note" | "link" | "other";

export interface Material {
  id: number;
  title: string;
  type: MaterialType;
  fileUrl?: string;
  subject?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMaterialRequest {
  title: string;
  type: MaterialType;
  fileUrl?: string;
  subject?: string;
}

export interface UpdateMaterialRequest {
  title?: string;
  type?: MaterialType;
  fileUrl?: string;
  subject?: string;
}

export interface ListMaterialsResponse {
  materials: Material[];
}
