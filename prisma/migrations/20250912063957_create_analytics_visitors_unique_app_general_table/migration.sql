-- CreateTable
CREATE TABLE "public"."analytics_visitors_unique_app_general" (
    "id" SERIAL NOT NULL,
    "visitors_count" INTEGER NOT NULL,

    CONSTRAINT "analytics_visitors_unique_app_general_pkey" PRIMARY KEY ("id")
);
