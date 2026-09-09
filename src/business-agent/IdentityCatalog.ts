/** Synthetic employee records shared by local personas and Entra provisioning. */
export type IdentityPersona = { id: string; displayName: string; jobTitle: string; departmentId: string; roleIds: string[]; groupIds: string[] };
export type IdentityCatalog = { schemaVersion: string; companyId: string; synthetic: boolean; emailDomain: string; personas: IdentityPersona[] };
