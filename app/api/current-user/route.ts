import { APP_CONFIG } from "@/lib/app-config";
import { createSessionClient } from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { account, databases } = await createSessionClient();
    const user = await account.get();

    const shopDocuments = await databases.listDocuments(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.SHOP_ID,
      [Query.equal("userId", user.$id)]
    );

    const shop = shopDocuments.documents?.[0];

    return NextResponse.json({
      message: "User fetch successfully",
      user,
      shop,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
