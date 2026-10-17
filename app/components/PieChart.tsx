"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "A donut chart with text";

const chartData = [
  { category: "child", patients: 170, fill: "var(--color-child)" },
  { category: "teen", patients: 90, fill: "var(--color-teen)" },
  { category: "adult", patients: 50, fill: "var(--color-adult)" },
  { category: "older", patients: 45, fill: "var(--color-older)" },
];

const chartConfig = {
  patients: {
    label: "Patients",
  },
  child: {
    label: "Child",
    color: "var(--chart-1)",
  },
  teen: {
    label: "Teen",
    color: "var(--chart-2)",
  },
  adult: {
    label: "Adult",
    color: "var(--chart-3)",
  },
  older: {
    label: "Older",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function ChartPieDonutText() {
  const totalPatients = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.patients, 0);
  }, []);

  return (
    <Card className="flex flex-col p-1">
      <CardContent className="flex-1 p-0 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square min-w-50"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="patients"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalPatients.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Patients
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
