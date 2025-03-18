import NavBar from "@/components/NavBar";
import { getLoggedInUser } from "@/lib/appwrite";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getLoggedInUser();
    if(!user) redirect("/");
    return (
        <div className="w-full">
            <div className="flex flex-col w-full h-auto">
                <NavBar />
                <main>{children}</main>
            </div>
        </div>
    )
}