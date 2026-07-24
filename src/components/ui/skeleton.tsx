import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`bg-slate-200 animate-pulse rounded-lg ${className}`}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="p-6 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="w-12 h-4" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-32 h-8" />
            </div>
        </div>
    );
}

export function SkeletonTableRow() {
    return (
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-20 h-3" />
                </div>
            </div>
            <Skeleton className="w-16 h-4" />
        </div>
    );
}
