import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
});

// Saved locations for quick access
export const savedLocations = pgTable("saved_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  coordinates: text("coordinates").notNull(), // stored as "lng,lat"
  type: text("type").notNull(), // "address", "poi", or "w3w"
  isFavorite: boolean("is_favorite").default(false),
  w3wAddress: text("w3w_address"), // only for what3words locations
  createdAt: text("created_at").notNull(), // timestamp stored as text
});

// Navigation history
export const navigationHistory = pgTable("navigation_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  originName: text("origin_name").notNull(),
  originCoordinates: text("origin_coordinates").notNull(), // stored as "lng,lat"
  destinationName: text("destination_name").notNull(),
  destinationCoordinates: text("destination_coordinates").notNull(), // stored as "lng,lat"
  distance: integer("distance").notNull(), // in meters
  duration: integer("duration").notNull(), // in seconds
  routeData: jsonb("route_data"), // store the route data as JSON
  createdAt: text("created_at").notNull(), // timestamp stored as text
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

export const insertSavedLocationSchema = createInsertSchema(savedLocations).pick({
  userId: true,
  name: true,
  address: true,
  coordinates: true,
  type: true,
  isFavorite: true,
  w3wAddress: true,
  createdAt: true,
});

export const insertNavigationHistorySchema = createInsertSchema(navigationHistory).pick({
  userId: true,
  originName: true,
  originCoordinates: true,
  destinationName: true,
  destinationCoordinates: true,
  distance: true,
  duration: true,
  routeData: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSavedLocation = z.infer<typeof insertSavedLocationSchema>;
export type SavedLocation = typeof savedLocations.$inferSelect;

export type InsertNavigationHistory = z.infer<typeof insertNavigationHistorySchema>;
export type NavigationHistory = typeof navigationHistory.$inferSelect;
