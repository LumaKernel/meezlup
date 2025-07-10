-- AlterTable
ALTER TABLE "User" ADD COLUMN "preferredLanguage" TEXT DEFAULT 'ja';

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dateRangeStart" DATETIME NOT NULL,
    "dateRangeEnd" DATETIME NOT NULL,
    "timeSlotDuration" INTEGER NOT NULL,
    "deadline" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "participantRestrictionType" TEXT NOT NULL DEFAULT 'none',
    "allowedDomains" TEXT NOT NULL DEFAULT '[]',
    "allowedEmails" TEXT NOT NULL DEFAULT '[]',
    "creatorId" TEXT,
    "creatorCanSeeEmails" BOOLEAN NOT NULL DEFAULT false,
    "participantsCanSeeEach" BOOLEAN NOT NULL DEFAULT false,
    "isLinkOnly" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("allowedDomains", "allowedEmails", "createdAt", "creatorCanSeeEmails", "creatorId", "dateRangeEnd", "dateRangeStart", "deadline", "description", "id", "name", "participantRestrictionType", "participantsCanSeeEach", "timeSlotDuration", "updatedAt") SELECT "allowedDomains", "allowedEmails", "createdAt", "creatorCanSeeEmails", "creatorId", "dateRangeEnd", "dateRangeStart", "deadline", "description", "id", "name", "participantRestrictionType", "participantsCanSeeEach", "timeSlotDuration", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_creatorId_idx" ON "Event"("creatorId");
CREATE INDEX "Event_dateRangeStart_dateRangeEnd_idx" ON "Event"("dateRangeStart", "dateRangeEnd");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
