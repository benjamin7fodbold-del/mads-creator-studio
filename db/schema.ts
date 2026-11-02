import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const studioVideos=sqliteTable('studio_videos',{id:text('id').primaryKey(),data:text('data').notNull(),version:integer('version').notNull().default(1)});
export const studioMeta=sqliteTable('studio_meta',{id:text('id').primaryKey(),value:text('value').notNull()});
