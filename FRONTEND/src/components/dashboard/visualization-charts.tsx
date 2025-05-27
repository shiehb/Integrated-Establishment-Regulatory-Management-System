"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Sample data for charts
const monthlyData = [
  { name: "Jan", permits: 65, applications: 28, inspections: 42 },
  { name: "Feb", permits: 59, applications: 48, inspections: 38 },
  { name: "Mar", permits: 80, applications: 40, inspections: 55 },
  { name: "Apr", permits: 81, applications: 27, inspections: 63 },
  { name: "May", permits: 56, applications: 38, inspections: 41 },
  { name: "Jun", permits: 55, applications: 43, inspections: 39 },
  { name: "Jul", permits: 72, applications: 35, inspections: 48 },
]

const pieData = [
  { name: "Approved", value: 540, color: "#10b981" },
  { name: "Pending", value: 210, color: "#f59e0b" },
  { name: "Rejected", value: 92, color: "#ef4444" },
]

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]

export function VisualizationCharts() {
  const [activeTab, setActiveTab] = useState("overview")

  const chartConfig = {
    permits: {
      label: "Permits",
      theme: { light: "#2563eb", dark: "#3b82f6" },
    },
    applications: {
      label: "Applications",
      theme: { light: "#8b5cf6", dark: "#a78bfa" },
    },
    inspections: {
      label: "Inspections",
      theme: { light: "#f59e0b", dark: "#fbbf24" },
    },
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
        <CardDescription>Visualized data for permits, applications, and inspections</CardDescription>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="permits">Permits</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <Tabs>
      <CardContent className="px-2 sm:px-6">
        <TabsContent value="overview" className="mt-0 border-none p-0">
          <div className="h-[300px] sm:h-[400px]">
            <ChartContainer config={chartConfig}>
              <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="permits"
                  stroke="var(--color-permits)"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="applications" stroke="var(--color-applications)" strokeWidth={2} />
                <Line type="monotone" dataKey="inspections" stroke="var(--color-inspections)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="permits" className="mt-0 border-none p-0">
          <div className="h-[300px] sm:h-[400px]">
            <ChartContainer config={chartConfig}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="permits" fill="var(--color-permits)" />
                <Bar dataKey="applications" fill="var(--color-applications)" />
                <Bar dataKey="inspections" fill="var(--color-inspections)" />
              </BarChart>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="mt-0 border-none p-0">
          <div className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </CardContent>
      </Tabs>
    </Card>
  )
}
