START TRANSACTION
SELECT "User"."id" AS "User_id", "User"."name" AS "User_name", "User"."defaultPurseId" AS "User_defaultPurseId"
FROM "user" "User"
WHERE "User"."id" IN ($1)
SELECT "User"."id" AS "User_id", "User"."name" AS "User_name", "User"."defaultPurseId" AS "User_defaultPurseId"
FROM "user" "User"
WHERE "User"."id" IN ($1)
SELECT "Purse"."id" AS "Purse_id", "Purse"."balance" AS "Purse_balance", "Purse"."userId" AS "Purse_userId"
FROM "purse" "Purse"
WHERE "Purse"."id" IN ($1)
SELECT "Purse"."id" AS "Purse_id", "Purse"."balance" AS "Purse_balance", "Purse"."userId" AS "Purse_userId"
FROM "purse" "Purse"
WHERE "Purse"."id" IN ($1)
SELECT "Purse"."id" AS "Purse_id", "Purse"."balance" AS "Purse_balance", "Purse"."userId" AS "Purse_userId"
FROM "purse" "Purse"
WHERE "Purse"."id" IN ($1)
UPDATE "purse"
SET "balance" = $2
WHERE "id" IN ($1)
SELECT "Purse"."id" AS "Purse_id", "Purse"."balance" AS "Purse_balance", "Purse"."userId" AS "Purse_userId"
FROM "purse" "Purse"
WHERE "Purse"."id" IN ($1)
UPDATE "purse"
SET "balance" = $2
WHERE "id" IN ($1)
COMMIT
