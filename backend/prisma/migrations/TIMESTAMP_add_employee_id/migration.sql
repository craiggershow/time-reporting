-- AlterTable
ALTER TABLE "User" ADD COLUMN "employeeId" TEXT;

-- Create unique index
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- Update existing records with sequential employee IDs
WITH numbered_users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") as rnum
  FROM "User"
)
UPDATE "User"
SET "employeeId" = LPAD(numbered_users.rnum::text, 6, '0')
FROM numbered_users
WHERE "User".id = numbered_users.id;

-- Make employeeId NOT NULL after populating data
ALTER TABLE "User" ALTER COLUMN "employeeId" SET NOT NULL; 