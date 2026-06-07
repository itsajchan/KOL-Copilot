import type { Metadata } from 'next';
import { MedicalAffairsDashboard } from '@/components/dashboard/medical-affairs-dashboard';
import type { ScreenKey } from '@/components/dashboard/medical-affairs-dashboard';

const VALID_SCREENS = new Set<ScreenKey>([
  'protocols',
  'runs',
  'overview',
  'brief',
  'queries',
  'evidence',
  'candidates',
  'ranking',
  'compliance',
  'moss',
  'summary',
]);

export const metadata: Metadata = {
  title: 'KOL Copilot Dashboard',
  description: 'Protocol-aware Medical Affairs orchestration dashboard.',
};

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const requestedScreen = firstParam(params.screen);
  const initialScreen =
    requestedScreen && VALID_SCREENS.has(requestedScreen as ScreenKey)
      ? (requestedScreen as ScreenKey)
      : 'overview';
  const initialUploadOpen = firstParam(params.upload) === '1';

  return (
    <MedicalAffairsDashboard initialScreen={initialScreen} initialUploadOpen={initialUploadOpen} />
  );
}
