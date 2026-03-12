import { z } from 'zod'

export const completeProfileSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'),
  
  bio: z.string()
    .min(1, 'Bio is required')
    .max(160, 'Bio must be less than 160 characters'),
  
  primaryRole: z.string()
    .min(1, 'Primary role is required')
    .refine(
      (role) => ['founder', 'co-founder', 'developer', 'designer', 'pm', 'marketer', 'investor', 'student', 'other'].includes(role),
      'Invalid role selected'
    ),
  
  startupName: z.string()
    .max(100, 'Startup name must be less than 100 characters')
    .optional()
    .nullable(),
  
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .nullable(),
  
  website: z.string()
    .url('Please enter a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  profileImage: z.instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'Profile image must be less than 5MB'
    )
    .optional()
    .nullable(),
  
  interests: z.array(z.string())
    .max(5, 'You can select a maximum of 5 interests'),
})

export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>
