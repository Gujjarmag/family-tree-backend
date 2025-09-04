-- CreateTable
CREATE TABLE "public"."Tree" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Tree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Member" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "photoUrl" TEXT,
    "gender" TEXT,
    "showFemale" BOOLEAN NOT NULL DEFAULT true,
    "spouseId" INTEGER,
    "treeId" INTEGER NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_spouseId_key" ON "public"."Member"("spouseId");

-- AddForeignKey
ALTER TABLE "public"."Tree" ADD CONSTRAINT "Tree_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Member" ADD CONSTRAINT "Member_spouseId_fkey" FOREIGN KEY ("spouseId") REFERENCES "public"."Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Member" ADD CONSTRAINT "Member_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "public"."Tree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Member" ADD CONSTRAINT "Member_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
