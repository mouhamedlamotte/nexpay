"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { useProjectStore } from "@/stores/project.store";

const Dashboard = () => {
  const projectId = useProjectStore((state) => state.currentProject?.id!);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'| '1d'>('7d');

  const { data, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get(projectId, { timeRange }),
  });

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d'| '1d') => {
    setTimeRange(range);
    refetch();
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "wave":
        return "bg-blue-500";
      case "om":
        return "bg-orange-500";
      default:
        return "bg-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      SUCCEEDED: "bg-green-100 text-green-700 border-green-300",
      FAILED: "bg-red-100 text-red-700 border-red-300",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
    };
    return variants[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <main className="flex-1 overflow-y-auto p-2 md:p-6 space-y-4">
      {/* Header */}
      <div className="md:flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h2>
          <p className="text-gray-400 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex items-center space-x-2 mt-4">
                    <Button 
            variant={timeRange === '1d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeRangeChange('1d')}
            className={timeRange === '1d' ? 'bg-indigo-600' : 'bg-[#252937] text-gray-300 border-gray-700 hover:bg-[#2d3243]'}
          >
            1 jour
          </Button>
          <Button 
            variant={timeRange === '7d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeRangeChange('7d')}
            className={timeRange === '7d' ? 'bg-indigo-600' : 'bg-[#252937] text-gray-300 border-gray-700 hover:bg-[#2d3243]'}
          >
            7 jours
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeRangeChange('30d')}
            className={timeRange === '30d' ? 'bg-indigo-600' : 'bg-[#252937] text-gray-300 border-gray-700 hover:bg-[#2d3243]'}
          >
            30 jours
          </Button>
          <Button 
            variant={timeRange === '90d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => handleTimeRangeChange('90d')}
            className={timeRange === '90d' ? 'bg-indigo-600' : 'bg-[#252937] text-gray-300 border-gray-700 hover:bg-[#2d3243]'}
          >
            90 jours
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className=" ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Volume Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(data?.stats?.totalVolume || 0)}
            </div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+{data?.stats?.growth?.volume}% vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card className=" ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data?.stats?.totalTransactions}
            </div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>
                +{data?.stats?.growth?.transactions}% vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className=" ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Taux de Réussite
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data?.stats?.successRate}%
            </div>
            <div className="flex items-center text-xs text-green-500 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>
                +{data?.stats?.growth?.successRate}% vs période précédente
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Providers Performance */}
        <Card className="lg:col-span-4  ">
          <CardHeader>
            <CardTitle className="text-white">
              Performance par Provider
            </CardTitle>
            <CardDescription className="text-gray-400">
              Répartition du volume sur 30 jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data?.providerStats.map((provider) => (
                <div key={provider.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getProviderColor(
                          provider.code
                        )}`}
                      />
                      <span className="text-sm font-medium text-white">
                        {provider.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {formatCurrency(provider.volume)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {provider.transactions} transactions
                      </div>
                    </div>
                  </div>
                  <div className="relative h-2 bg-[#1a1d29] rounded-full overflow-hidden">
                    <div
                      className={`absolute h-full ${getProviderColor(
                        provider.code
                      )} rounded-full`}
                      style={{ width: `${(provider?.percentage || 0)?.toFixed(2)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">
                      Taux de réussite: {provider.successRate}%
                    </span>
                    <span className="text-gray-400">
                      {(provider?.percentage || 0).toFixed(2)}% du volume
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-3 ">
          <CardHeader>
            <CardTitle className="text-white">Statistiques Rapides</CardTitle>
            <CardDescription className="text-gray-400">
              Indicateurs clés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Montant moyen</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(data?.quickStats?.averageTransaction || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Nouveaux clients</span>
                <span className="text-sm font-bold text-white">
                  {data?.quickStats?.newPayers}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium text-white mb-3">
                Top Méthodes
              </h4>
              <div className="space-y-3">
                {data?.quickStats?.topMethods.map((method) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getProviderColor(
                          method.code
                        )}`}
                      />
                      <span className="text-sm text-gray-300">
                        {method.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {method.percentage?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transactions récentes</CardTitle>
            <CardDescription>Les 5 dernières transactions</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Voir tout
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            {data?.recentTransactions?.length ? (
              data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border bg-card text-card-foreground p-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(tx.status)}

                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-medium">
                          {tx.reference}
                        </span>
                        <Badge
                          variant={
                            tx.status === "SUCCEEDED"
                              ? "default"
                              : tx.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {tx.status === "SUCCEEDED"
                            ? "Complété"
                            : tx.status === "FAILED"
                            ? "Échoué"
                            : "En attente"}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        {tx.payer.name || tx.payer.phone || "Non renseigné"} •
                        Il y a {tx.timeAgo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="text-xs">
                      {tx.provider.name}
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune transaction récente
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Dashboard;
