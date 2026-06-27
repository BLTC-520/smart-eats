import { z } from 'zod'

/** Shared taste preferences for the two users (stored once, in the cloud). */
export const preferencesSchema = z.object({
  /** Preferred cuisines → search keywords + category matching. */
  cuisines: z.array(z.string()).default([]),
  /** Liked keywords → weighted higher in random selection. */
  likes: z.array(z.string()).default([]),
  /** Disliked keywords → excluded when name/category matches. */
  dislikes: z.array(z.string()).default([]),
  /** Only recommend places that are open right now. */
  onlyOpenNow: z.boolean().default(false),
  /** Default search radius in kilometres for the "just eat" mode. */
  defaultRadiusKm: z.number().min(0.5).max(10).default(3),
})

export type Preferences = z.infer<typeof preferencesSchema>

export const defaultPreferences: Preferences = preferencesSchema.parse({})
