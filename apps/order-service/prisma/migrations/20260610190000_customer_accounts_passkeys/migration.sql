ALTER TYPE "AuthSubjectType" ADD VALUE IF NOT EXISTS 'CUSTOMER';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE IF NOT EXISTS "CustomerPasskeyCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "deviceType" TEXT,
    "backedUp" BOOLEAN NOT NULL DEFAULT false,
    "transports" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerPasskeyCredential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CustomerAuthChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT,
    "purpose" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerAuthChallenge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CustomerOtpCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerOtpCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CustomerPasskeyCredential_credentialId_key" ON "CustomerPasskeyCredential"("credentialId");
CREATE INDEX IF NOT EXISTS "CustomerPasskeyCredential_userId_idx" ON "CustomerPasskeyCredential"("userId");
CREATE INDEX IF NOT EXISTS "CustomerAuthChallenge_userId_purpose_usedAt_idx" ON "CustomerAuthChallenge"("userId", "purpose", "usedAt");
CREATE INDEX IF NOT EXISTS "CustomerAuthChallenge_phone_purpose_usedAt_idx" ON "CustomerAuthChallenge"("phone", "purpose", "usedAt");
CREATE INDEX IF NOT EXISTS "CustomerOtpCode_phone_purpose_consumedAt_idx" ON "CustomerOtpCode"("phone", "purpose", "consumedAt");
CREATE INDEX IF NOT EXISTS "CustomerOtpCode_userId_idx" ON "CustomerOtpCode"("userId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CustomerPasskeyCredential_userId_fkey'
    ) THEN
        ALTER TABLE "CustomerPasskeyCredential"
        ADD CONSTRAINT "CustomerPasskeyCredential_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CustomerAuthChallenge_userId_fkey'
    ) THEN
        ALTER TABLE "CustomerAuthChallenge"
        ADD CONSTRAINT "CustomerAuthChallenge_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CustomerOtpCode_userId_fkey'
    ) THEN
        ALTER TABLE "CustomerOtpCode"
        ADD CONSTRAINT "CustomerOtpCode_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
