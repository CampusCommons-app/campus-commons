import { z } from 'zod';
export const schemas = {
  pages: {
    home: z.object({
      "hero": z.object({
        "headline": z.string(),
        "subhead": z.string(),
        "ctaPrimary": z.string(),
        "ctaSecondary": z.string()
      }),
      "mockClub": z.object({
        "name": z.string(),
        "tag": z.string(),
        "healthScore": z.number(),
        "attendance": z.string(),
        "attendancePercent": z.number(),
        "lastPost": z.string(),
        "postedAgo": z.string()
      }),
      "newsFeed": z.object({
        "sectionTitle": z.string(),
        "posts": z.array(z.object({
          "id": z.string(),
          "clubName": z.string(),
          "tag": z.string(),
          "tagColor": z.string(),
          "postedAgo": z.string(),
          "text": z.string()
        }))
      }),
      "leaderboard": z.object({
        "sectionTitle": z.string(),
        "clubs": z.array(z.object({
          "id": z.string(),
          "rank": z.number(),
          "name": z.string(),
          "healthScore": z.number(),
          "attendancePercent": z.number(),
          "memberCount": z.number(),
          "tag": z.string()
        }))
      }),
      "healthExplainer": z.object({
        "headline": z.string(),
        "subhead": z.string(),
        "description": z.string(),
        "stats": z.array(z.object({
          "id": z.string(),
          "value": z.string(),
          "label": z.string(),
          "description": z.string()
        }))
      }),
      "roles": z.object({
        "headline": z.string(),
        "columns": z.array(z.object({
          "id": z.string(),
          "role": z.string(),
          "tagline": z.string(),
          "bullets": z.array(z.string())
        }))
      }),
      "cta": z.object({
        "headline": z.string(),
        "subhead": z.string(),
        "description": z.string(),
        "buttonLabel": z.string(),
        "requestLabel": z.string()
      })
    }),
    discover: z.object({
      "CATEGORIES": z.array(z.string()),
      "SORT_OPTIONS": z.array(z.object({
        "value": z.string(),
        "label": z.string(),
        "id": z.string()
      }))
    }),
    discover_events: z.object({
      "EVENT_CATEGORIES": z.array(z.string())
    }),
    my_club: z.object({
      "ANNOUNCEMENTS": z.array(z.object({
        "id": z.string(),
        "title": z.string(),
        "body": z.string(),
        "author": z.string(),
        "time": z.string(),
        "pinned": z.boolean()
      })),
      "ATTENDANCE_HISTORY": z.array(z.object({
        "id": z.string(),
        "title": z.string(),
        "date": z.string(),
        "attended": z.boolean()
      })),
      "tabs": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      }))
    }),
    about: z.object({
      "ROLES": z.array(z.object({
        "label": z.string(),
        "points": z.array(z.string()),
        "id": z.string()
      }))
    }),
    dashboard: z.object({
      "DAY_LABELS": z.array(z.string())
    })
  }
};
export type Schemas = typeof schemas;