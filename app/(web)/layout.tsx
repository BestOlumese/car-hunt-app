import NavBar from "@/components/NavBar";
import React from "react";

export default function WebLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col w-full h-auto">
            <NavBar />
            <main>{children}</main>
        </div>
    )
}