-- DropForeignKey
ALTER TABLE "public"."Member" DROP CONSTRAINT "Member_treeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tree" DROP CONSTRAINT "Tree_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Member" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "notes" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Tree" ADD CONSTRAINT "Tree_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Member" ADD CONSTRAINT "Member_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "public"."Tree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
