/**
 * Componentes extraídos do Dashboard - Padrão Compound Components
 * Para uso em separado e melhor manutenibilidade
 */

// ============================================================================
// components/dashboard/KPICard.tsx
// ============================================================================

import Link from "next/link";
import { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

interface KPICardProps {
    icon: IconName;
    label: string;
    value: string;
    trend?: {
        icon: IconName;
        percentage: number;
    };
}

export function KPICard({
    icon,
    label,
    value,
    trend,
}: KPICardProps): ReactNode {
    return (
        <div className="p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300 hover:scale-105 transform">
            {/* Header do card */}
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded">
                    <Icon name={icon} className="text-blue-600" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                        <Icon name={trend.icon} className="text-base" />
                        {trend.percentage}%
                    </div>
                )}
            </div>

            {/* Info do card */}
            <div>
                <p className="text-gray-500 uppercase text-xs font-semibold tracking-wider">
                    {label}
                </p>
                <h4 className="text-gray-950 font-bold text-3xl mt-1">{value}</h4>
            </div>
        </div>
    );
}

// ============================================================================
// components/dashboard/ClientRankItem.tsx
// ============================================================================

interface ClientRankItemProps {
    position: number;
    name: string;
    service: string;
    revenue: string;
}

export function ClientRankItem({
    position,
    name,
    service,
    revenue,
}: ClientRankItemProps): ReactNode {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="flex items-center gap-3">
                {/* Badge de posição */}
                <div
                    className={`w-11 h-11 flex items-center justify-center rounded-lg font-bold text-sm ${position === 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                        }`}
                >
                    {position}
                </div>

                {/* Info do cliente */}
                <div>
                    <h5 className="text-sm font-semibold text-gray-900">{name}</h5>
                    <p className="text-xs text-gray-500">{service}</p>
                </div>
            </div>

            {/* Receita */}
            <div className="flex flex-col items-end">
                <span className="font-bold text-blue-600 text-sm">R${revenue}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                    Receita
                </span>
            </div>
        </div>
    );
}

// ============================================================================
// components/dashboard/RouteCard.tsx
// ============================================================================

interface RouteCardProps {
    hour: string;
    period: "AM" | "PM";
    objective: string;
    address: string;
}

export function RouteCard({
    hour,
    period,
    objective,
    address,
}: RouteCardProps): ReactNode {
    return (
        <div className="flex items-start gap-4 p-5 bg-white border-l-4 border-blue-600 rounded-lg hover:shadow-md transition-shadow">
            {/* Hora */}
            <div className="flex flex-col items-center min-w-fit">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {hour}
                </span>
                <span className="text-sm font-bold text-blue-600">{period}</span>
            </div>

            {/* Informações */}
            <div>
                <p className="font-semibold text-sm text-gray-900 mb-1">{objective}</p>
                <p className="text-xs text-gray-600">{address}</p>
            </div>
        </div>
    );
}

// ============================================================================
// components/dashboard/AlertBanner.tsx
// ============================================================================

interface AlertBannerProps {
    icon: IconName;
    message: string;
    type?: "error" | "warning" | "success" | "info";
}

export function AlertBanner({
    icon,
    message,
    type = "error",
}: AlertBannerProps): ReactNode {
    const typeStyles = {
        error: "text-red-600 bg-red-50 border-red-200",
        warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
        success: "text-green-600 bg-green-50 border-green-200",
        info: "text-blue-600 bg-blue-50 border-blue-200",
    };

    return (
        <div
            className={`py-3 px-5 border-2 rounded-2xl gap-3 flex items-center ${typeStyles[type]}`}
            role="alert"
        >
            <Icon name={icon} />
            {message}
        </div>
    );
}

// ============================================================================
// components/dashboard/SectionHeader.tsx
// ============================================================================

interface SectionHeaderProps {
    title: string;
    description: string;
    alert?: {
        icon: IconName;
        message: string;
    };
}

export function SectionHeader({
    title,
    description,
    alert,
}: SectionHeaderProps): ReactNode {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
                <h3 className="font-extrabold text-4xl text-gray-950">{title}</h3>
                <p className="text-gray-600 text-lg mt-1">{description}</p>
            </div>

            {alert && <AlertBanner icon={alert.icon} message={alert.message} />}
        </div>
    );
}

// ============================================================================
// components/dashboard/ChartHeader.tsx
// ============================================================================

interface ChartHeaderProps {
    title: string;
    subtitle: string;
    activePeriod?: "monthly" | "yearly"; // ✅ Nova prop
    onPeriodChange?: (period: "monthly" | "yearly") => void;
}

export function ChartHeader({
    title,
    subtitle,
    activePeriod = "monthly",
    onPeriodChange,
}: ChartHeaderProps): ReactNode {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div>
                <h4 className="text-gray-950 font-bold text-xl">{title}</h4>
                <p className="text-gray-600 text-sm">{subtitle}</p>
            </div>
            <div className="flex gap-2">
                {/* ✅ Mensal */}
                <button
                    onClick={() => onPeriodChange?.("monthly")}
                    className={`px-4 py-2 text-xs font-semibold rounded transition-colors cursor-pointer ${activePeriod === "monthly"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Mensalmente
                </button>

                {/* ✅ Anual */}
                <button
                    onClick={() => onPeriodChange?.("yearly")}
                    className={`px-4 py-2 text-xs font-semibold rounded transition-colors cursor-pointer ${activePeriod === "yearly"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Anualmente
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// components/dashboard/ClientsRankSection.tsx
// ============================================================================

interface ClientsRankSectionProps {
    clients: Array<{
        position: number;
        name: string;
        service: string;
        revenue: string;
    }>;
}

export function ClientsRankSection({
    clients,
}: ClientsRankSectionProps): ReactNode {
    return (
        <div className="p-7 rounded-2xl bg-white shadow-md flex flex-col gap-5">
            <h4 className="font-bold text-xl text-gray-900">Top Clientes</h4>

            <div className="flex flex-col gap-4">
                {clients.map((client) => (
                    <ClientRankItem key={client.position} {...client} />
                ))}
            </div>

            <Link
                href="/clientes"
                className="mt-3 w-full px-4 py-3 text-center border border-gray-300 rounded-lg text-blue-600 font-medium text-sm hover:bg-blue-50 transition-colors inline-block"
            >
                Ver lista completa
            </Link>
        </div>
    );
}

// ============================================================================
// components/dashboard/RoutesSection.tsx
// ============================================================================

interface RoutesSectionProps {
    routes: Array<{
        hour: string;
        period: "AM" | "PM";
        objective: string;
        address: string;
    }>;
}

export function RoutesSection({
    routes,
}: RoutesSectionProps): ReactNode {
    return (
        <div className="p-8 rounded-xl bg-gray-100">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h4 className="text-xl font-bold text-gray-950">Rotas de Hoje</h4>

                <Link
                    href="/rotas/mapa"
                    className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:text-blue-700"
                >
                    Ver no mapa
                    <Icon name="map" className="text-base" />
                </Link>

            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes.map((route, index) => (
                    <RouteCard key={index} {...route} />
                ))}
            </div>
        </div>
    );
}
