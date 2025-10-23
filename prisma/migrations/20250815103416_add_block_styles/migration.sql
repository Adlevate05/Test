-- CreateTable
CREATE TABLE "public"."block_styles" (
    "id" SERIAL NOT NULL,
    "handle" TEXT NOT NULL,
    "html_content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "block_styles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "block_styles_handle_key" ON "public"."block_styles"("handle");
