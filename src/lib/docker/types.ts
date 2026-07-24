export interface CreateTenantPodParams {
  id: string;
  name: string;
  slug: string;
  jwtSecret: string;
  dbPassword: string;
}

export interface TenantPodStatus {
  slug: string;
  dbContainerExists: boolean;
  dbRunning: boolean;
  restContainerExists: boolean;
  restRunning: boolean;
  authContainerExists?: boolean;
  authRunning?: boolean;
  cpuPercentage: number;
  memoryUsageMb: number;
}
