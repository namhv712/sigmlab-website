import { z } from 'zod'

export const QuartileSchema = z.enum(['Q1', 'Q2', 'Q3', 'Q4'])
export const CoreRankSchema = z.enum(['A*', 'A', 'B', 'C', 'unranked'])
export const CcfRankSchema = z.enum(['A', 'B', 'C', 'unranked'])
export const EraRankSchema = z.enum(['A*', 'A', 'B', 'C', 'unranked'])

export const DeadlineKindSchema = z.enum([
  'abstract', 'full-paper', 'rebuttal', 'notification',
  'camera-ready', 'registration', 'rolling',
])

export const DeadlineSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  kind: DeadlineKindSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:?\d{2}|Z)?)?$/),
  timezone: z.string().optional(),
  note: z.string().optional(),
})

export const RankingsSchema = z.object({
  scopus: z.boolean().optional(),
  isi: z.boolean().optional(),
  dblp: z.boolean().optional(),
  scimagoQuartile: QuartileSchema.optional(),
  sjr: z.number().nonnegative().optional(),
  jcrImpactFactor: z.number().nonnegative().optional(),
  jcrQuartile: QuartileSchema.optional(),
  citeScore: z.number().nonnegative().optional(),
  hIndex: z.number().int().nonnegative().optional(),
  core: CoreRankSchema.optional(),
  era: EraRankSchema.optional(),
  ccf: CcfRankSchema.optional(),
  qualis: z.string().optional(),
  thcpl: z.string().optional(),
}).strict()

export const VenueSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be lowercase a-z, 0-9, hyphen'),
  name: z.string().min(1),
  fullName: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  type: z.enum(['conference', 'journal', 'workshop']),
  topics: z.array(z.string()).min(1),
  website: z.string().url(),
  publisher: z.string().optional(),
  issn: z.string().optional(),
  eIssn: z.string().optional(),
  rankings: RankingsSchema,
  deadlines: z.array(DeadlineSchema).optional(),
  frequency: z.enum(['annual', 'biannual', 'rolling', 'irregular']),
  acceptanceRate: z.number().min(0).max(1).optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  parent: z.string().regex(/^[a-z0-9-]+$/).optional(),
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).strict()

export const VenuesDatasetSchema = z.object({
  $schema: z.string().optional(),
  generatedAt: z.string().optional(),
  venues: z.array(VenueSchema),
})
