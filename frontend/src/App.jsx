import { useState, useEffect } from "react";
import PeakChart from "./components/PeakChart";

function App() {
    const [specialization, setSpecialization] = useState("early");
    const [riskLevel, setRiskLevel] = useState("medium");
    const [iterations, setIterations] = useState(2500);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [compareMode, setCompareMode] = useState(false);

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Toggle Theme
    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // Dynamic Styles Object
    const theme = {
        bg: isDarkMode
            ? "animate-gradient-bg text-gray-100"
            : "bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-900", // Much lighter background for light mode

        card: isDarkMode
            ? "bg-gray-900/80 backdrop-blur-md border-gray-800 shadow-2xl"
            : "bg-white/80 backdrop-blur-md border-white/50 shadow-xl",

        textHeader: isDarkMode
            ? "text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600"
            : "text-gray-900",

        textSub: isDarkMode ? "text-gray-400" : "text-gray-600",

        inputBg: isDarkMode ? "bg-gray-800/50 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900",

        accentColor: isDarkMode ? "text-green-400" : "text-indigo-600",

        buttonPrimary: isDarkMode
            ? "bg-gradient-to-r from-green-700 to-emerald-900 hover:from-green-600 hover:to-emerald-800 text-white border-green-800/30"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg",

        metricCard: isDarkMode
            ? "bg-gray-800/50 border-green-900/30 text-gray-300"
            : "bg-white border-gray-100 text-gray-800 shadow-sm",
    };

    const runSimulation = async () => {
        setLoading(true);
        try {
            const endpoint = compareMode
                ? "http://127.0.0.1:8000/comparative"
                : "http://127.0.0.1:8000/simulate";

            const body = {
                specialization: specialization,
                risk_level: riskLevel,
                iterations: iterations,
            };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Simulation failed:", error);
            alert("Failed to run simulation. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const getComparisonData = () => {
        if (!result) return null;

        if (!compareMode) {
            return {
                selected: result,
                baseline: null,
                delta: null,
            };
        }

        let selectedKey = "specialist";
        if (riskLevel === "high") selectedKey = "risktaker";

        const selected = result[selectedKey];
        const baseline = result.control;

        const probSelected = selected.metrics.director_probability.mean;
        const probBaseline = baseline.metrics.director_probability.mean;
        const delta = (probSelected - probBaseline) * 100;

        return {
            selected,
            baseline,
            delta,
            selectedKey,
        };
    };

    const comparison = getComparisonData();
    const displayResult = comparison ? comparison.selected : null;

    return (
        <div className={`min-h-screen p-4 md:p-8 transition-colors duration-500 ${theme.bg}`}>
            <div className="w-full max-w-7xl mx-auto">

                {/* Header Card */}
                <div className={`rounded-2xl p-8 mb-6 border ${theme.card} flex justify-between items-start`}>
                    <div>
                        <h1 className={`text-4xl font-bold mb-2 ${theme.textHeader}`}>
                            PathDiverge
                        </h1>
                        <p className={`${theme.textSub} text-lg font-light tracking-wide`}>
                            Career Butterfly Simulator — <span className={`font-mono text-sm ${theme.accentColor}`}>v1.2.0</span>
                        </p>
                    </div>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className={`p-3 rounded-full transition-all duration-300 ${isDarkMode ? "bg-gray-800 text-yellow-400 hover:bg-gray-700" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"}`}
                        title="Toggle Theme"
                    >
                        {isDarkMode ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Input Card */}
                <div className={`rounded-2xl p-8 mb-6 border ${theme.card}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-2xl font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                            Simulation Parameters
                        </h2>

                        {/* Compare Toggle */}
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                            <input
                                type="checkbox"
                                id="compareToggle"
                                checked={compareMode}
                                onChange={() => {
                                    setCompareMode(!compareMode);
                                    setResult(null);
                                }}
                                className={`w-5 h-5 rounded cursor-pointer ${isDarkMode ? "text-green-600 bg-gray-900 border-gray-600 focus:ring-green-500" : "text-indigo-600 border-gray-300 focus:ring-indigo-500"}`}
                            />
                            <label
                                htmlFor="compareToggle"
                                className={`text-sm font-medium cursor-pointer select-none transition-colors ${theme.textSub}`}
                            >
                                Compare with Baseline
                            </label>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Specialization */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 uppercase tracking-wider ${theme.textSub}`}>
                                    Specialization Strategy
                                </label>
                                <select
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    disabled={compareMode}
                                    className={`w-full px-4 py-3 rounded-xl focus:ring-2 transition duration-200 border ${theme.inputBg} ${isDarkMode ? "focus:ring-green-500 hover:border-gray-600" : "focus:ring-indigo-500 hover:border-gray-300"
                                        } ${compareMode ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <option value="early">Early Specialization</option>
                                    <option value="none">Generalist Path</option>
                                </select>
                                {compareMode && (
                                    <p className={`text-xs mt-1 font-mono ${theme.accentColor}`}>
                                        {">"} COMPARING: SPECIALIST VS BASELINE
                                    </p>
                                )}
                            </div>

                            {/* Risk Level */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 uppercase tracking-wider ${theme.textSub}`}>
                                    Risk Tolerance
                                </label>
                                <select
                                    value={riskLevel}
                                    onChange={(e) => setRiskLevel(e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl focus:ring-2 transition duration-200 border ${theme.inputBg} ${isDarkMode ? "focus:ring-green-500 hover:border-gray-600" : "focus:ring-indigo-500 hover:border-gray-300"
                                        }`}
                                >
                                    <option value="medium">Balanced (Medium Risk)</option>
                                    <option value="high">Aggressive (High Risk)</option>
                                </select>
                            </div>
                        </div>

                        {/* Iterations */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 uppercase tracking-wider flex justify-between ${theme.textSub}`}>
                                <span>Iterations</span>
                                <span className={`font-mono ${theme.accentColor}`}>{iterations.toLocaleString()}</span>
                            </label>
                            <input
                                type="range"
                                min="500"
                                max="5000"
                                step="500"
                                value={iterations}
                                onChange={(e) => setIterations(parseInt(e.target.value))}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isDarkMode ? "bg-gray-700 accent-green-500" : "bg-gray-200 accent-indigo-600"}`}
                            />
                        </div>

                        {/* Run Button */}
                        <button
                            onClick={runSimulation}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold transition duration-200 shadow-lg transform hover:-translate-y-0.5 border ${theme.buttonPrimary}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className={`animate-spin h-5 w-5 ${isDarkMode ? "text-green-400" : "text-white"}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span className="font-mono tracking-wider">PROCESSING...</span>
                                </span>
                            ) : (
                                <span className="font-mono tracking-wider">
                                    {compareMode ? "RUN COMPARATIVE ANALYSIS" : "RUN SIMULATION"}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Card */}
                {displayResult && (
                    <div className={`relative rounded-2xl p-8 animate-fade-in border ${theme.card}`}>

                        {/* Loading Overlay */}
                        {loading && (
                            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="animate-spin h-8 w-8 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-white font-mono text-sm tracking-wider">RECALCULATING...</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                {compareMode ? "Comparative Analysis" : "Simulation Results"}
                            </h2>
                            {compareMode && (
                                <span className={`px-3 py-1 rounded-full text-sm font-mono uppercase border ${isDarkMode ? "bg-green-900/30 text-green-400 border-green-800/50" : "bg-indigo-100 text-indigo-700 border-indigo-200"}`}>
                                    {comparison.selectedKey === "risktaker" ? "High Risk" : "Specialist"} vs Baseline
                                </span>
                            )}
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Director+ Probability */}
                            <div className={`p-6 rounded-xl border transition duration-300 ${theme.metricCard}`}>
                                <h3 className="text-xs font-medium opacity-70 mb-1 uppercase tracking-widest">
                                    Director+ Probability
                                </h3>
                                <div className="flex items-baseline gap-3">
                                    <p className={`text-4xl font-bold font-mono ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                                        {(displayResult.metrics.director_probability.mean * 100).toFixed(1)}%
                                    </p>

                                    {/* Delta Badge */}
                                    {compareMode && comparison.delta !== null && (
                                        <div
                                            className={`px-3 py-1 rounded text-sm font-bold font-mono flex items-center cursor-help ${comparison.delta > 0
                                                    ? (isDarkMode ? "bg-green-900/50 text-green-400 border border-green-800/50" : "bg-green-100 text-green-800 border border-green-200")
                                                    : (isDarkMode ? "bg-red-900/50 text-red-400 border border-red-800/50" : "bg-red-100 text-red-800 border border-red-200")
                                                }`}
                                            title={`Exact difference: ${comparison.delta > 0 ? "+" : ""}${comparison.delta.toFixed(4)} pp`}
                                        >
                                            <span className="text-lg mr-1">{comparison.delta > 0 ? "▲" : "▼"}</span>
                                            {Math.abs(comparison.delta).toFixed(1)} pp
                                        </div>
                                    )}
                                </div>

                                {compareMode && (
                                    <div className="mt-2 text-xs opacity-60 font-mono">
                                        BASE: {(comparison.baseline.metrics.director_probability.mean * 100).toFixed(1)}%
                                    </div>
                                )}
                            </div>

                            {/* Retirement Age */}
                            <div className={`p-6 rounded-xl border transition duration-300 ${theme.metricCard}`}>
                                <h3 className="text-xs font-medium opacity-70 mb-1 uppercase tracking-widest">
                                    Retirement Age
                                </h3>
                                <p className={`text-4xl font-bold font-mono ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                                    {displayResult.metrics.retirement_age.mean ? displayResult.metrics.retirement_age.mean.toFixed(1) : 'N/A'}
                                </p>
                                {displayResult.metrics.retirement_age.std && (
                                    <p className="text-xs opacity-60 mt-2 font-mono">
                                        ± {displayResult.metrics.retirement_age.std.toFixed(1)} yrs
                                    </p>
                                )}
                            </div>

                            {/* Unemployment Years */}
                            <div className={`p-6 rounded-xl border transition duration-300 ${theme.metricCard}`}>
                                <h3 className="text-xs font-medium opacity-70 mb-1 uppercase tracking-widest">
                                    Unemployment
                                </h3>
                                <p className={`text-4xl font-bold font-mono ${isDarkMode ? "text-amber-500" : "text-amber-600"}`}>
                                    {displayResult.metrics.unemployment_years.mean.toFixed(1)} <span className="text-lg opacity-60">yrs</span>
                                </p>
                            </div>

                            {/* Peak Role */}
                            <div className={`p-6 rounded-xl border transition duration-300 ${theme.metricCard}`}>
                                <h3 className="text-xs font-medium opacity-70 mb-1 uppercase tracking-widest">
                                    Peak Role
                                </h3>
                                <p className={`text-2xl font-bold truncate ${isDarkMode ? "text-purple-400" : "text-purple-600"}`}>
                                    {Object.entries(displayResult.distributions.peak_role)
                                        .sort((a, b) => b[1] - a[1])[0][0]}
                                </p>
                                <div className="text-xs opacity-60 mt-2 font-mono">
                                    {(Object.entries(displayResult.distributions.peak_role)
                                        .sort((a, b) => b[1] - a[1])[0][1] * 100).toFixed(1)}% prob
                                </div>
                            </div>
                        </div>

                        {/* Peak Role Distribution Details */}
                        <div className={`rounded-xl p-6 border mb-6 ${isDarkMode ? "bg-gray-800/30 border-gray-700/50" : "bg-gray-50 border-gray-200"}`}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-baseline gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                Distribution Analysis
                                <span className={`text-xs font-normal font-mono uppercase tracking-wider ${isDarkMode ? "text-green-500/50" : "text-indigo-400"}`}> // Interactive Visualization</span>
                            </h3>
                            <div className="h-72 w-full">
                                <PeakChart
                                    data={displayResult.distributions.peak_role}
                                    comparisonData={compareMode ? comparison.baseline.distributions.peak_role : null}
                                />
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className={`rounded-xl p-4 border border-t-2 ${isDarkMode ? "bg-gray-900 border-gray-800 border-t-green-900" : "bg-gray-50 border-gray-200 border-t-indigo-500"}`}>
                            <div className="flex flex-wrap gap-6 text-xs text-gray-500 font-mono uppercase tracking-wider">
                                <div>
                                    <span className={isDarkMode ? "text-green-600" : "text-indigo-600"}>STATE:</span>{" "}
                                    {compareMode ? "COMPARATIVE_MODE" : "SINGLE_MODE"}
                                </div>
                                <div>
                                    <span className={isDarkMode ? "text-green-600" : "text-indigo-600"}>STRATEGY:</span>{" "}
                                    {!compareMode ? (displayResult.meta.config.specialization === "early"
                                        ? "EARLY_SPEC"
                                        : "GENERALIST") : (comparison.selectedKey === "risktaker" ? "HIGH_RISK" : "EARLY_SPEC")}
                                </div>
                                <div>
                                    <span className={isDarkMode ? "text-green-600" : "text-indigo-600"}>SAMPLES:</span>{" "}
                                    {compareMode ? iterations.toLocaleString() : displayResult.meta.total_simulations.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
