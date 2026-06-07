import type { Metadata } from 'next';
import { MedicalAffairsDashboard } from '@/components/dashboard/medical-affairs-dashboard';
import type {
  DashboardProtocol,
  ScreenKey,
} from '@/components/dashboard/medical-affairs-dashboard';
import { prisma } from '@/lib/prisma';

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

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const DEFAULT_STAGE_DEFS = [
  { key: 'parsed', label: 'Parsed' },
  { key: 'brief', label: 'Brief Extracted' },
  { key: 'queries', label: 'Queries Generated' },
  { key: 'evidence', label: 'Evidence Retrieved' },
  { key: 'kols', label: 'KOLs Extracted' },
  { key: 'ranked', label: 'Ranked' },
  { key: 'moss', label: 'Indexed in Moss' },
  { key: 'review', label: 'Ready for Review' },
] satisfies Array<{ key: string; label: string }>;

const ACTIVE_STAGE_BY_PROTOCOL_STATUS: Record<string, number | null> = {
  QUEUED: null,
  PARSING: 0,
  EXTRACTING: 1,
  RETRIEVING_EVIDENCE: 3,
  RANKING: 5,
  INDEXING: 6,
  READY_FOR_REVIEW: 7,
  COMPLETED: null,
  FAILED: 0,
  ARCHIVED: null,
};

function titleCaseEnum(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function protocolStatusLabel(status: string) {
  const labels: Record<string, string> = {
    QUEUED: 'Queued',
    PARSING: 'Parsing',
    EXTRACTING: 'Extracting brief',
    RETRIEVING_EVIDENCE: 'Retrieving evidence',
    RANKING: 'Ranking in progress',
    INDEXING: 'Indexing in Moss',
    READY_FOR_REVIEW: 'Ready for review',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
    ARCHIVED: 'Archived',
  };

  return labels[status] ?? titleCaseEnum(status);
}

function protocolStatusTone(status: string): DashboardProtocol['statusTone'] {
  if (status === 'COMPLETED') {
    return 'safe';
  }
  if (status === 'READY_FOR_REVIEW') {
    return 'accent';
  }
  if (status === 'FAILED') {
    return 'risk';
  }
  if (status === 'INDEXING') {
    return 'compliance';
  }
  if (status === 'QUEUED' || status === 'ARCHIVED') {
    return 'neutral';
  }

  return 'evidence';
}

function stageState(status: string): DashboardProtocol['stages'][number]['state'] {
  const states: Record<string, DashboardProtocol['stages'][number]['state']> = {
    PENDING: 'pending',
    ACTIVE: 'active',
    DONE: 'done',
    WARN: 'warn',
    ERROR: 'error',
    SKIPPED: 'pending',
  };

  return states[status] ?? 'pending';
}

function defaultStageDetail(stageKey: string, counts: ProtocolCounts, statusLabel: string) {
  const details: Record<string, string> = {
    parsed: counts.chunks > 0 ? `${counts.chunks} chunks` : 'Pending',
    brief: counts.briefSections > 0 ? `${counts.briefSections} sections` : 'Pending',
    queries: counts.queryGroups > 0 ? `${counts.queryGroups} groups` : 'Pending',
    evidence: counts.evidenceSnippets > 0 ? `${counts.evidenceSnippets} sources` : 'Pending',
    kols: counts.candidates > 0 ? `${counts.candidates} candidates` : 'Pending',
    ranked: counts.candidates > 0 ? `${counts.candidates} scored` : 'Pending',
    moss: counts.mossAssets > 0 ? `${counts.mossAssets} assets` : 'Pending',
    review: statusLabel,
  };

  return details[stageKey] ?? 'Pending';
}

function defaultStages(status: string, counts: ProtocolCounts): DashboardProtocol['stages'] {
  const activeIndex = ACTIVE_STAGE_BY_PROTOCOL_STATUS[status] ?? null;
  const statusLabel = protocolStatusLabel(status);
  const isCompleted = status === 'COMPLETED' || status === 'ARCHIVED';

  return DEFAULT_STAGE_DEFS.map((stage, index) => {
    let state: DashboardProtocol['stages'][number]['state'] = 'pending';

    if (status === 'FAILED' && index === activeIndex) {
      state = 'error';
    } else if (isCompleted || (activeIndex !== null && index < activeIndex)) {
      state = 'done';
    } else if (activeIndex === index) {
      state = 'active';
    }

    return {
      ...stage,
      state,
      detail:
        state === 'pending' && status === 'QUEUED'
          ? index === 0
            ? 'Queued'
            : 'Pending'
          : defaultStageDetail(stage.key, counts, statusLabel),
    };
  });
}

function formatUpdated(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');
  const hours = `${date.getUTCHours()}`.padStart(2, '0');
  const minutes = `${date.getUTCMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

function enrollmentDisplay(display: string | null, target: number | null) {
  if (display) {
    return display;
  }

  if (target !== null) {
    return target.toLocaleString('en-US');
  }

  return '-';
}

type ProtocolCounts = {
  chunks: number;
  briefSections: number;
  queryGroups: number;
  evidenceSnippets: number;
  candidates: number;
  mossAssets: number;
};

async function getDashboardProtocols(): Promise<DashboardProtocol[]> {
  const protocols = await prisma.protocol.findMany({
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      _count: {
        select: {
          chunks: true,
          briefSections: true,
          queryGroups: true,
          evidenceSnippets: true,
          candidates: true,
          mossAssets: true,
        },
      },
      runs: {
        orderBy: [{ startedAt: 'desc' }, { createdAt: 'desc' }],
        take: 1,
        include: {
          stages: {
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          },
        },
      },
    },
  });

  return protocols.map((protocol, index) => {
    const latestRun = protocol.runs[0];
    const status = protocol.status.toString();
    const counts = protocol._count;
    const stages =
      latestRun?.stages.length > 0
        ? latestRun.stages.map((stage) => ({
            key: stage.key.toString().toLowerCase(),
            label: stage.label,
            state: stageState(stage.status.toString()),
            detail:
              stage.detail ??
              defaultStageDetail(
                stage.key.toString().toLowerCase(),
                counts,
                protocolStatusLabel(status)
              ),
          }))
        : defaultStages(status, counts);

    return {
      id: protocol.protocolCode,
      nct: protocol.nctId ?? 'Not registered',
      run: latestRun?.runKey ?? null,
      title: protocol.title,
      sponsor: protocol.sponsor ?? '-',
      phase: protocol.phase ?? '-',
      indication: protocol.indication ?? '-',
      geo: protocol.geographies.length > 0 ? protocol.geographies : ['-'],
      enrollment: enrollmentDisplay(protocol.enrollmentDisplay, protocol.enrollmentTarget),
      status: protocolStatusLabel(status),
      statusTone: protocolStatusTone(status),
      updated: formatUpdated(protocol.updatedAt),
      active: index === 0,
      stages,
    };
  });
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const requestedScreen = firstParam(params.screen);
  const initialScreen =
    requestedScreen && VALID_SCREENS.has(requestedScreen as ScreenKey)
      ? (requestedScreen as ScreenKey)
      : 'overview';
  const initialUploadOpen = firstParam(params.upload) === '1';
  let dashboardProtocols: DashboardProtocol[] = [];
  let protocolLoadError: string | null = null;

  try {
    dashboardProtocols = await getDashboardProtocols();
  } catch (error) {
    console.error('Failed to load dashboard protocols from Prisma', error);
    protocolLoadError =
      'Could not load protocols from the database. Check DATABASE_URL and Prisma connectivity.';
  }

  return (
    <MedicalAffairsDashboard
      initialScreen={initialScreen}
      initialUploadOpen={initialUploadOpen}
      protocols={dashboardProtocols}
      protocolLoadError={protocolLoadError}
    />
  );
}
