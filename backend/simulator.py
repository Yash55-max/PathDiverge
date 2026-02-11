"""
Career Path Butterfly Simulator - Clean Backend Interface
Monte Carlo simulation engine for career trajectory analysis
"""

import random
import numpy as np
from typing import Dict, List, Tuple, Optional


# Career states
STATES = [
    "Entry Level", "Junior", "Mid-Level", "Senior",
    "Lead", "Manager", "Director", "VP", "C-Suite",
    "Retired", "Unemployed"
]

# Base transition probabilities (CALIBRATED for semi-realistic outcomes)
TRANSITIONS = {
    "Entry Level": {"Entry Level": 0.45, "Junior": 0.30, "Mid-Level": 0.05, "Unemployed": 0.20},
    "Junior": {"Junior": 0.40, "Mid-Level": 0.30, "Senior": 0.05, "Entry Level": 0.10, "Unemployed": 0.15},
    "Mid-Level": {"Mid-Level": 0.50, "Senior": 0.20, "Lead": 0.05, "Junior": 0.10, "Unemployed": 0.15},
    "Senior": {"Senior": 0.55, "Lead": 0.15, "Manager": 0.10, "Mid-Level": 0.10, "Unemployed": 0.10},
    "Lead": {"Lead": 0.50, "Manager": 0.20, "Director": 0.05, "Senior": 0.15, "Unemployed": 0.10},
    "Manager": {"Manager": 0.55, "Director": 0.15, "Lead": 0.15, "Senior": 0.05, "Unemployed": 0.10},
    "Director": {"Director": 0.60, "VP": 0.10, "Manager": 0.15, "Unemployed": 0.15},
    "VP": {"VP": 0.65, "C-Suite": 0.08, "Director": 0.15, "Unemployed": 0.12},
    "C-Suite": {"C-Suite": 0.70, "VP": 0.10, "Unemployed": 0.10, "Retired": 0.10},
    "Retired": {"Retired": 1.0},
    "Unemployed": {"Unemployed": 0.40, "Entry Level": 0.30, "Junior": 0.18, "Mid-Level": 0.10, "Retired": 0.02}  # Reduced stickiness
}


class CareerProfile:
    """Track career decisions and their impacts"""
    
    def __init__(self, early_specialization: bool = False, risk_tolerance: str = "medium"):
        self.early_specialization = early_specialization
        self.risk_tolerance = risk_tolerance
        self.unemployment_history = []
        self.burnout_score = 0
        self.momentum_score = 0
        self.total_demotions = 0
        self.total_promotions = 0
        
    def update_burnout(self, current_state: str, years_worked: int):
        """Update burnout score based on current position"""
        stress_levels = {
            "C-Suite": 5, "VP": 4, "Director": 3, "Manager": 2, "Lead": 2,
            "Senior": 1, "Mid-Level": 0, "Junior": 0, "Entry Level": 0, "Unemployed": -2
        }
        self.burnout_score += stress_levels.get(current_state, 0)
        self.burnout_score = max(0, self.burnout_score - 0.5)
        
    def update_momentum(self, old_state: str, new_state: str):
        """Update career momentum based on transitions"""
        state_ranks = {
            "Entry Level": 1, "Junior": 2, "Mid-Level": 3, "Senior": 4, "Lead": 5,
            "Manager": 6, "Director": 7, "VP": 8, "C-Suite": 9, "Unemployed": 0, "Retired": 0
        }
        old_rank = state_ranks.get(old_state, 0)
        new_rank = state_ranks.get(new_state, 0)
        
        if new_rank > old_rank:
            self.momentum_score += 2
            self.total_promotions += 1
        elif new_rank < old_rank:
            self.momentum_score = max(0, self.momentum_score - 3)
            self.total_demotions += 1
        
        self.momentum_score = max(0, self.momentum_score * 0.9)


def get_retirement_probability(profile: CareerProfile, current_state: str, 
                               years_worked: int, age: int) -> float:
    """Calculate retirement probability based on age, state, and profile"""
    if current_state == "Retired":
        return 1.0
    
    # CALIBRATION FIX: Minimum retirement age = 55
    if age < 55:
        return 0.0
    
    # Age-based baseline (adjusted for 60-65 mean)
    if age < 58:
        base_prob = 0.005  # Very low before 58
    elif age < 62:
        base_prob = 0.03   # Gradual increase
    elif age < 65:
        base_prob = 0.12   # Peak retirement years
    elif age < 68:
        base_prob = 0.30   # Strong retirement pressure
    else:
        base_prob = 0.60   # Very high after 68
    
    # Burnout factor (reduced impact for more stability)
    burnout_factor = min(profile.burnout_score / 150, 0.15)  # Reduced from /100 and 0.3
    
    # Momentum factor (reduced impact)
    momentum_factor = -min(profile.momentum_score / 80, 0.10)  # Reduced from /50 and 0.2
    
    # State-specific adjustments (refined)
    if age > 60 and current_state in ["Entry Level", "Junior", "Mid-Level"]:
        base_prob += 0.10  # Reduced from 0.15
    if current_state in ["C-Suite", "VP", "Director"]:
        base_prob -= 0.05  # Reduced from 0.10 (executives work longer but not forever)
    if current_state == "Unemployed" and age > 58:
        base_prob += 0.15  # Reduced from 0.20, starts at 58 not 55
    
    return max(0, min(1.0, base_prob + burnout_factor + momentum_factor))


def apply_decision_modifiers(profile: CareerProfile, transitions: Dict[str, float], 
                             current_state: str, years_worked: int) -> Dict[str, float]:
    """Apply decision-based modifiers to transition probabilities"""
    modified = transitions.copy()
    
    # Early specialization effects
    if profile.early_specialization:
        if current_state in ["Entry Level", "Junior"]:
            for state in modified:
                if state in ["Junior", "Mid-Level", "Senior"]:
                    modified[state] = modified.get(state, 0) * 1.3
        elif current_state in ["Senior", "Lead"]:
            modified[current_state] = modified.get(current_state, 0) * 1.2
    else:
        # Generalist advantages at higher levels
        if current_state in ["Manager", "Director", "VP"]:
            for state in ["Director", "VP", "C-Suite"]:
                if state in modified:
                    modified[state] = modified.get(state, 0) * 1.25
    
    # CALIBRATION FIX: Risk tolerance effects
    if profile.risk_tolerance == "high":
        # During unemployment: better re-employment but riskier targets
        if current_state == "Unemployed":
            modified["Mid-Level"] = modified.get("Mid-Level", 0) * 1.5
            modified["Unemployed"] = modified.get("Unemployed", 0) * 0.75  # Better recovery
        
        # At senior levels: higher promotion variance (upside!)
        elif current_state in ["Senior", "Lead", "Manager"]:
            for state in ["Lead", "Manager", "Director"]:
                if state in modified and state != current_state:
                    modified[state] = modified.get(state, 0) * 1.35  # Promotion boost
        
        # At director+ levels: swing for the fences
        elif current_state in ["Director", "VP"]:
            for state in ["VP", "C-Suite"]:
                if state in modified:
                    modified[state] = modified.get(state, 0) * 1.40
    
    elif profile.risk_tolerance == "low":
        # During unemployment: safer re-entry
        if current_state == "Unemployed":
            modified["Entry Level"] = modified.get("Entry Level", 0) * 1.3
            modified["Unemployed"] = modified.get("Unemployed", 0) * 1.05  # Slightly stickier
        
        # At all levels: prefer stability
        if current_state in modified:
            modified[current_state] = modified.get(current_state, 0) * 1.15
    
    # Normalize probabilities
    total = sum(modified.values())
    if total > 0:
        modified = {k: v/total for k, v in modified.items()}
    
    return modified


def simulate_career(max_years: int = 45, starting_age: int = 22, 
                   profile: Optional[CareerProfile] = None) -> Tuple[List[str], CareerProfile]:
    """
    Simulate a single career trajectory
    
    Args:
        max_years: Maximum career duration in years
        starting_age: Starting age of the individual
        profile: CareerProfile with decision parameters
        
    Returns:
        Tuple of (career_path, profile)
    """
    if profile is None:
        profile = CareerProfile()
    
    current_state = "Entry Level"
    career_path = [current_state]
    current_age = starting_age
    
    for year in range(max_years):
        current_age += 1
        
        if current_state == "Retired":
            career_path.append(current_state)
            continue
        
        profile.update_burnout(current_state, year)
        
        # Check for retirement
        retirement_prob = get_retirement_probability(profile, current_state, year, current_age)
        if random.random() < retirement_prob:
            current_state = "Retired"
            career_path.append(current_state)
            continue
        
        # Transition to next state
        base_transitions = TRANSITIONS[current_state]
        modified_transitions = apply_decision_modifiers(profile, base_transitions, current_state, year)
        
        next_states = list(modified_transitions.keys())
        probabilities = list(modified_transitions.values())
        
        old_state = current_state
        next_state = random.choices(next_states, weights=probabilities, k=1)[0]
        
        profile.update_momentum(old_state, next_state)
        
        if next_state == "Unemployed":
            profile.unemployment_history.append(year)
        
        career_path.append(next_state)
        current_state = next_state
    
    return career_path, profile


def get_peak_position(career: List[str]) -> str:
    """Get the highest career position achieved"""
    state_ranks = {
        "Unemployed": 0, "Entry Level": 1, "Junior": 2, "Mid-Level": 3,
        "Senior": 4, "Lead": 5, "Manager": 6, "Director": 7,
        "VP": 8, "C-Suite": 9, "Retired": 0
    }
    
    max_rank = 0
    peak_state = "Entry Level"
    
    for state in career:
        rank = state_ranks.get(state, 0)
        if rank > max_rank:
            max_rank = rank
            peak_state = state
    
    return peak_state


def run_simulation(config: dict) -> dict:
    """
    Run Monte Carlo simulation with specified configuration
    
    Args:
        config: Configuration dictionary with keys:
            - specialization: "early" or "none" (default: "none")
            - risk_level: "high", "medium", or "low" (default: "medium")
            - iterations: number of career simulations (default: 2500)
            - max_years: maximum career duration (default: 45)
            - starting_age: starting age (default: 22)
            - compute_ci: whether to compute confidence intervals (default: False)
            - ci_iterations: number of bootstrap iterations for CI (default: 30)
    
    Returns:
        Production-clean structured dictionary:
        {
            "metrics": {
                "director_probability": {
                    "mean": 0.368,
                    "ci_lower": 0.350,  # if compute_ci=True
                    "ci_upper": 0.382   # if compute_ci=True
                },
                "retirement_age": {
                    "mean": 62.4,
                    "std": 4.2
                },
                "unemployment_years": {
                    "mean": 2.3,
                    "median": 3.0
                }
            },
            "distributions": {
                "peak_role": {
                    "Junior": 0.12,
                    "Senior": 0.31,
                    ...
                }
            },
            "meta": {
                "total_simulations": 2500,
                "config": {...}
            }
        }
    
    Example:
        >>> config = {
        ...     "specialization": "early",
        ...     "risk_level": "high",
        ...     "iterations": 2500,
        ...     "compute_ci": True
        ... }
        >>> results = run_simulation(config)
        >>> prob = results['metrics']['director_probability']['mean']
        >>> print(f"Director+ probability: {prob:.1%}")
    """
    # Parse configuration
    early_spec = config.get("specialization", "none") == "early"
    risk_level = config.get("risk_level", "medium")
    iterations = config.get("iterations", 2500)
    max_years = config.get("max_years", 45)
    starting_age = config.get("starting_age", 22)
    compute_ci = config.get("compute_ci", False)
    ci_iterations = config.get("ci_iterations", 30)
    
    # State ranking for director+ calculation
    state_ranks = {
        "Entry Level": 1, "Junior": 2, "Mid-Level": 3, "Senior": 4,
        "Lead": 5, "Manager": 6, "Director": 7, "VP": 8, "C-Suite": 9
    }
    
    def run_batch(n_simulations):
        """Run a batch of simulations and return raw metrics"""
        careers_data = []
        
        for _ in range(n_simulations):
            profile = CareerProfile(early_specialization=early_spec, risk_tolerance=risk_level)
            career, profile = simulate_career(max_years=max_years, starting_age=starting_age, profile=profile)
            peak = get_peak_position(career)
            
            careers_data.append({
                'career': career,
                'peak': peak,
                'profile': profile,
                'final_state': career[-1]
            })
        
        # Calculate metrics
        director_plus_count = sum(1 for r in careers_data if state_ranks.get(r['peak'], 0) >= 7)
        director_prob = director_plus_count / len(careers_data)
        
        # Retirement age statistics
        retire_ages = [starting_age + r['career'].index("Retired") 
                       for r in careers_data if "Retired" in r['career']]
        
        # Unemployment statistics - FIXED: count total years, not year indices
        unemployment_durations = [len(r['profile'].unemployment_history) for r in careers_data]
        
        # Peak position distribution
        peak_counts = {}
        for r in careers_data:
            peak = r['peak']
            peak_counts[peak] = peak_counts.get(peak, 0) + 1
        
        return {
            'director_prob': director_prob,
            'retire_ages': retire_ages,
            'unemployment_durations': unemployment_durations,
            'peak_counts': peak_counts,
            'total': len(careers_data)
        }
    
    # Run primary simulation
    primary_results = run_batch(iterations)
    
    # Build director probability metric
    director_metric = {"mean": round(primary_results['director_prob'], 4)}
    
    # Compute confidence intervals if requested
    if compute_ci:
        bootstrap_probs = []
        for _ in range(ci_iterations):
            batch = run_batch(iterations)
            bootstrap_probs.append(batch['director_prob'])
        
        director_metric["ci_lower"] = round(float(np.percentile(bootstrap_probs, 2.5)), 4)
        director_metric["ci_upper"] = round(float(np.percentile(bootstrap_probs, 97.5)), 4)
    
    # Build retirement age metric
    retire_ages = primary_results['retire_ages']
    retirement_metric = {
        "mean": round(float(np.mean(retire_ages)), 2) if retire_ages else None,
        "std": round(float(np.std(retire_ages)), 2) if retire_ages else None
    }
    
    # Build unemployment metric
    unemp_durations = primary_results['unemployment_durations']
    unemployment_metric = {
        "mean": round(float(np.mean(unemp_durations)), 2) if unemp_durations else 0.0,
        "median": round(float(np.median(unemp_durations)), 2) if unemp_durations else None,
        "std": round(float(np.std(unemp_durations)), 2) if unemp_durations else None
    }
    
    # Build peak distribution (normalized probabilities)
    peak_counts = primary_results['peak_counts']
    total = primary_results['total']
    peak_distribution = {k: round(v / total, 4) for k, v in peak_counts.items()}
    
    # Return production-clean structured output
    return {
        "metrics": {
            "director_probability": director_metric,
            "retirement_age": retirement_metric,
            "unemployment_years": unemployment_metric
        },
        "distributions": {
            "peak_role": peak_distribution
        },
        "meta": {
            "total_simulations": iterations,
            "config": {
                "specialization": "early" if early_spec else "none",
                "risk_level": risk_level,
                "iterations": iterations,
                "max_years": max_years,
                "starting_age": starting_age,
                "compute_ci": compute_ci
            }
        }
    }


def run_comparative_analysis(iterations: int = 2500, compute_ci: bool = False) -> dict:
    """
    Run comparative analysis across different intervention strategies
    
    Args:
        iterations: Number of simulations per intervention
        compute_ci: Whether to compute confidence intervals
        
    Returns:
        Dictionary with results for each intervention:
            - control: baseline (no specialization, medium risk)
            - specialist: early specialization, medium risk
            - risktaker: no specialization, high risk
            - deltas: impact vs control
    """
    interventions = {
        "control": {"specialization": "none", "risk_level": "medium"},
        "specialist": {"specialization": "early", "risk_level": "medium"},
        "risktaker": {"specialization": "none", "risk_level": "high"}
    }
    
    results = {}
    
    for name, config in interventions.items():
        config["iterations"] = iterations
        config["compute_ci"] = compute_ci
        results[name] = run_simulation(config)
    
    # Calculate deltas vs control (using decimal probabilities)
    control_prob = results["control"]["metrics"]["director_probability"]["mean"]
    
    results["deltas"] = {
        "specialist_vs_control": round(
            results["specialist"]["metrics"]["director_probability"]["mean"] - control_prob, 4
        ),
        "risktaker_vs_control": round(
            results["risktaker"]["metrics"]["director_probability"]["mean"] - control_prob, 4
        )
    }
    
    return results


if __name__ == "__main__":
    # Example usage
    print("=" * 70)
    print("CAREER PATH BUTTERFLY SIMULATOR - Backend Interface")
    print("=" * 70)
    
    # Example 1: Single simulation without CI
    print("\n1. Single Simulation (Fast):")
    print("-" * 70)
    config = {
        "specialization": "early",
        "risk_level": "high",
        "iterations": 2500
    }
    
    results = run_simulation(config)
    
    print(f"\nConfiguration: {config}")
    print(f"\nMetrics:")
    prob = results['metrics']['director_probability']['mean']
    print(f"  Director+ Probability: {prob:.1%} (decimal: {prob:.4f})")
    
    retire = results['metrics']['retirement_age']
    print(f"  Retirement Age: {retire['mean']:.1f} ± {retire['std']:.1f} years")
    
    unemp = results['metrics']['unemployment_years']
    print(f"  Unemployment: mean={unemp['mean']:.1f}, median={unemp['median']:.1f}")
    
    print(f"\nPeak Role Distribution:")
    for role, prob in sorted(results['distributions']['peak_role'].items(), 
                            key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {role:15s}: {prob:.1%}")
    
    # Example 2: Single simulation WITH confidence intervals
    print("\n" + "=" * 70)
    print("2. Single Simulation with Confidence Intervals (Slower):")
    print("-" * 70)
    
    config_ci = {
        "specialization": "early",
        "risk_level": "high",
        "iterations": 2500,
        "compute_ci": True,
        "ci_iterations": 30
    }
    
    results_ci = run_simulation(config_ci)
    
    director = results_ci['metrics']['director_probability']
    print(f"\nDirector+ Probability:")
    print(f"  Mean:  {director['mean']:.1%}")
    print(f"  95% CI: [{director['ci_lower']:.1%}, {director['ci_upper']:.1%}]")
    print(f"  (Decimal: {director['mean']:.4f} [{director['ci_lower']:.4f}, {director['ci_upper']:.4f}])")
    
    # Example 3: Comparative analysis
    print("\n" + "=" * 70)
    print("3. Comparative Analysis (3 Interventions):")
    print("-" * 70)
    
    comparative = run_comparative_analysis(iterations=2500, compute_ci=False)
    
    print("\nDirector+ Achievement Rates:")
    print(f"{'Intervention':<15} {'Probability':>12} {'Percentage':>12}")
    print("-" * 70)
    
    for intervention in ["control", "specialist", "risktaker"]:
        prob = comparative[intervention]['metrics']['director_probability']['mean']
        print(f"{intervention.capitalize():<15} {prob:>12.4f} {prob:>11.1%}")
    
    print("\nImpact vs Control (Butterfly Effect):")
    deltas = comparative['deltas']
    print(f"  Early Specialization: {deltas['specialist_vs_control']:+.4f} ({deltas['specialist_vs_control']*100:+.2f} pp)")
    print(f"  High Risk Tolerance:  {deltas['risktaker_vs_control']:+.4f} ({deltas['risktaker_vs_control']*100:+.2f} pp)")
    
    print("\n" + "=" * 70)
    print("✅ Backend returns clean, structured data")
    print("✅ Probabilities as decimals (0-1), not percentages")
    print("✅ Metrics/Distributions/Meta separated")
    print("✅ Optional confidence intervals for statistical rigor")
    print("=" * 70)
