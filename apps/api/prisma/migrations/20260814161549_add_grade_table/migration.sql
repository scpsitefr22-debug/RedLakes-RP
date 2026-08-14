-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('STAFF', 'MTF', 'RECHERCHE', 'ADMINISTRATION');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LoreCategory" AS ENUM ('MONDE', 'SITE', 'CHRONOLOGIE', 'GUERRES', 'CATASTROPHES', 'PERSONNAGES', 'SCP', 'FACTION', 'EVENEMENT');

-- CreateEnum
CREATE TYPE "LoreStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('MESSAGE', 'ANNOUNCE', 'MEMBER_JOIN', 'MEMBER_LEAVE', 'EVENT', 'BOOST');

-- CreateEnum
CREATE TYPE "PersonnelReportType" AS ENUM ('INCIDENT', 'AUTHORIZATION', 'MEMO', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "PersonnelReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlatformEntityType" AS ENUM ('PERSONNEL_REPORT', 'APPLICATION', 'LORE_ARTICLE', 'PLAYER', 'USER');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'ARCHIVED', 'RESTORED', 'REVIEWED', 'STATUS_CHANGED', 'COMMENT_ADDED', 'CLEARANCE_CHANGED', 'ROLE_CHANGED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "minecraftUuid" TEXT,
    "minecraftUsername" TEXT,
    "microsoftId" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "discordId" TEXT,
    "discordUsername" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grade" TEXT NOT NULL DEFAULT 'Civil',
    "faction" TEXT NOT NULL DEFAULT 'Civil',
    "teamName" TEXT,
    "rpFirstName" TEXT,
    "rpLastName" TEXT,
    "playtime" INTEGER NOT NULL DEFAULT 0,
    "seniority" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reputation" INTEGER NOT NULL DEFAULT 50,
    "sanctions" INTEGER NOT NULL DEFAULT 0,
    "clearance" INTEGER NOT NULL DEFAULT 1,
    "medals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "achievements" JSONB NOT NULL DEFAULT '[]',
    "inventory" JSONB NOT NULL DEFAULT '[]',
    "roleUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ApplicationType" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "experience" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "staffNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoreArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "category" "LoreCategory" NOT NULL,
    "status" "LoreStatus" NOT NULL DEFAULT 'DRAFT',
    "clearance" INTEGER NOT NULL DEFAULT 1,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "authorId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoreArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryAsset" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "faction" TEXT,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonnelReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PersonnelReportType" NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "PersonnelReportStatus" NOT NULL DEFAULT 'PENDING',
    "clearance" INTEGER NOT NULL DEFAULT 2,
    "staffNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonnelReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscordTransmission" (
    "id" TEXT NOT NULL,
    "type" "TransmissionType" NOT NULL,
    "discordMessageId" TEXT,
    "channelId" TEXT,
    "channelLabel" TEXT NOT NULL DEFAULT 'Secteur non répertorié',
    "clearance" INTEGER NOT NULL DEFAULT 3,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "codename" TEXT NOT NULL DEFAULT 'Entité ███',
    "authorHash" TEXT,
    "authorDisplay" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "excerpt" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscordTransmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" "PlatformEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" TEXT,
    "actorLabel" TEXT,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "clearance" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformComment" (
    "id" TEXT NOT NULL,
    "entityType" "PlatformEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "entityType" "PlatformEntityType",
    "entityId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformEntityTag" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "entityType" "PlatformEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformEntityTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "departmentId" TEXT,
    "pay" INTEGER,
    "quota" INTEGER,
    "clearance" INTEGER NOT NULL,
    "description" TEXT,
    "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "utilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessZones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "siteSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_minecraftUuid_key" ON "User"("minecraftUuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_minecraftUsername_key" ON "User"("minecraftUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_microsoftId_key" ON "User"("microsoftId");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_type_idx" ON "Application"("type");

-- CreateIndex
CREATE UNIQUE INDEX "LoreArticle_slug_key" ON "LoreArticle"("slug");

-- CreateIndex
CREATE INDEX "LoreArticle_status_category_idx" ON "LoreArticle"("status", "category");

-- CreateIndex
CREATE INDEX "LoreArticle_publishedAt_idx" ON "LoreArticle"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LinkCode_code_key" ON "LinkCode"("code");

-- CreateIndex
CREATE INDEX "PersonnelReport_status_idx" ON "PersonnelReport"("status");

-- CreateIndex
CREATE INDEX "PersonnelReport_userId_idx" ON "PersonnelReport"("userId");

-- CreateIndex
CREATE INDEX "PersonnelReport_createdAt_idx" ON "PersonnelReport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordTransmission_discordMessageId_key" ON "DiscordTransmission"("discordMessageId");

-- CreateIndex
CREATE INDEX "DiscordTransmission_occurredAt_idx" ON "DiscordTransmission"("occurredAt");

-- CreateIndex
CREATE INDEX "DiscordTransmission_clearance_idx" ON "DiscordTransmission"("clearance");

-- CreateIndex
CREATE INDEX "DiscordTransmission_type_idx" ON "DiscordTransmission"("type");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "PlatformComment_entityType_entityId_idx" ON "PlatformComment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "PlatformComment_authorId_idx" ON "PlatformComment"("authorId");

-- CreateIndex
CREATE INDEX "PlatformNotification_userId_readAt_idx" ON "PlatformNotification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "PlatformNotification_userId_createdAt_idx" ON "PlatformNotification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformTag_slug_key" ON "PlatformTag"("slug");

-- CreateIndex
CREATE INDEX "PlatformEntityTag_entityType_entityId_idx" ON "PlatformEntityTag"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformEntityTag_tagId_entityType_entityId_key" ON "PlatformEntityTag"("tagId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_slug_key" ON "Grade"("slug");

-- CreateIndex
CREATE INDEX "Grade_branch_idx" ON "Grade"("branch");

-- CreateIndex
CREATE INDEX "Grade_departmentId_idx" ON "Grade"("departmentId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoreArticle" ADD CONSTRAINT "LoreArticle_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonnelReport" ADD CONSTRAINT "PersonnelReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformComment" ADD CONSTRAINT "PlatformComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformNotification" ADD CONSTRAINT "PlatformNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformEntityTag" ADD CONSTRAINT "PlatformEntityTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "PlatformTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
