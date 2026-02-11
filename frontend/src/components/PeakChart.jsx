import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

export default function PeakChart({ data, comparisonData = null }) {
    // Sort roles by hierarchy level
    const roleOrder = [
        "Unemployed",
        "Entry Level",
        "Junior",
        "Mid-Level",
        "Senior",
        "Lead",
        "Manager",
        "Director",
        "VP",
        "C-Suite",
    ];

    // Merge data for comparison if needed
    const formatted = Object.entries(data)
        .map(([role, value]) => ({
            role,
            scenario: value * 100, // Current scenario
            baseline: comparisonData ? (comparisonData[role] || 0) * 100 : 0, // Baseline
            order: roleOrder.indexOf(role) !== -1 ? roleOrder.indexOf(role) : 99,
        }))
        .sort((a, b) => a.order - b.order);

    const formatPercentage = (value) => `${value.toFixed(1)}%`;

    return (
        <div className="h-72 mt-2 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={formatted}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                    <XAxis
                        dataKey="role"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11 }}
                        angle={-25}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        tickFormatter={formatPercentage}
                    />
                    <Tooltip
                        cursor={{ fill: "#f3f4f6" }}
                        contentStyle={{
                            borderRadius: "0.75rem",
                            border: "none",
                            boxShadow:
                                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        }}
                        formatter={(value, name) => [
                            `${value.toFixed(1)}%`,
                            name === "scenario" ? "Selected Strategy" : "Baseline (Control)",
                        ]}
                        labelStyle={{ fontWeight: "bold", color: "#374151" }}
                    />
                    {comparisonData && (
                        <Legend
                            verticalAlign="top"
                            height={36}
                            wrapperStyle={{ fontSize: "12px", fontWeight: 500 }}
                        />
                    )}

                    {/* Baseline Bar (Gray) - Only show in comparison mode */}
                    {comparisonData && (
                        <Bar
                            dataKey="baseline"
                            name="Baseline"
                            fill="#9ca3af"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                            animationDuration={1500}
                        />
                    )}

                    {/* Scenario Bar (Colored) */}
                    <Bar
                        dataKey="scenario"
                        name="Selected"
                        radius={[4, 4, 0, 0]}
                        barSize={comparisonData ? 20 : 40}
                        animationDuration={1500}
                    >
                        {formatted.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    entry.role === "Director" ||
                                        entry.role === "VP" ||
                                        entry.role === "C-Suite"
                                        ? "#8b5cf6" // Highlight executive roles in purple
                                        : "#6366f1" // Standard indigo for others
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

