"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { QuizResultRecord } from "@/lib/services"

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

type StudentProgressChartProps = {
  data: QuizResultRecord[];
}

export function StudentProgressChart({ data }: StudentProgressChartProps) {
  if (data.length === 0) return null;

  const averageScore = data.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0) / data.length;
  
  const chartData = [
    { metric: "Average Score", score: Math.round(averageScore) },
  ];

  return (
    <div className="w-full">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{
            left: -20,
          }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="metric"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <XAxis dataKey="score" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="score" layout="vertical" radius={5} barSize={40} fill="var(--color-score)" />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
