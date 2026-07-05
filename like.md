harsh@harsh-HP-Laptop-14s-dr1xxx:/media/harsh/New Volume/Github/2026/harshrb.in/words/backend$ bunx wrangler d1 execute quote-db --remote --command "

UPDATE quotes

SET likes = (ABS(RANDOM()) % 100) + 1;"


bunx wrangler d1 execute quote-db --remote --command "SELECT count(*) from quotes"