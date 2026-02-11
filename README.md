# 🦋 PathDiverge: Career Butterfly Simulator

![Project Banner](https://img.shields.io/badge/Status-Active-success?style=for-the-badge) ![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white) ![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)

> *"In just 3 small decisions, your career trajectory can shift by $2M or 15 years. PathDiverge quantifies that chaos."*

## 🚀 The Problem: Career Uncertainty
Traditional career planning assumes a linear path. In reality, careers are **stochastic systems** influenced by thousands of micro-variables—promotions, layoffs, market shifts, and pure luck.

Most people optimize for the *average* outcome. **PathDiverge helps you optimize for the distribution.**

By running **5,000 Monte Carlo simulations** in parallel, this application reveals the hidden probability distributions of your career, showing not just *what* might happen, but *how likely* extreme outcomes (good or bad) really are.

---

## 🏗️ Architecture & Tech Stack

This project is built as a modern, full-stack data application designed for performance and interactive visualization.

### **Frontend (The "Dashboard")**
-   **Framework**: React (Vite) for high-performance rendering.
-   **Styling**: **Tailwind CSS** with a custom "Matrix/Sci-Fi" aesthetic (Dark Mode) & Professional SaaS theme (Light Mode).
-   **Visualization**: **Recharts** for interactive data storytelling (Probability distributions, Comparative analysis).
-   **State Management**: React Hooks for real-time simulation parameter handling.

### **Backend (The "Engine")**
-   **Framework**: **FastAPI** (Python) for asynchronous, high-concurrency simulation handling.
-   **Simulation Logic**: Custom **Monte Carlo engine** capable of modeling complex career state transitions (Promotion, Stagnation, Layout, Pivot).
-   **Statistical Analysis**: Real-time computation of Confidence Intervals (95% CI), Standard Deviations, and Comparative Deltas (pp difference).

### **Key Features**
-   **🦋 The Butterfly Effect Engine**: Models how small changes in initial conditions (risk tolerance, specialization) compound over 40 years.
-   **📊 Comparative Analysis**: "What-If" machine that runs parallel simulations to compare a user's chosen strategy against a baseline control group.
-   **🎨 Dual-Theme UI**: A polished interface offering both a futuristic data-viz mode and a clean executive dashboard mode.

---

## 🛠️ How It Works (The Math)

The simulation engine treats a career as a **Markov Chain-like process** where state transitions are probabilistic but influenced by "Strategy Cards":

1.  **Base Probabilities**: Every role (Junior -> CEO) has base promotion/attrition rates.
2.  **Multipliers**: 
    -   *Specialists* get a `1.5x` promotion multiplier early but `0.8x` flexibility later.
    -   *Generalists* maintain a steady `1.0x` but gain `1.2x` exit opportunities.
3.  **The "Pivot"**: Unemployment or stagnation triggers a "forced pivot," simulating real-world resilience.

---

## 📦 Installation & Setup

### **Prerequisites**
-   Node.js & npm
-   Python 3.10+

### **1. Clone the Repository**
```bash
git clone https://github.com/Yash55-max/PathDiverge.git
cd PathDiverge
```

### **2. Backend Setup**
Navigate to the backend directory and fire up the simulation engine:
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
*The API will be live at `http://127.0.0.1:8000`*

### **3. Frontend Setup**
Launch the visualization dashboard:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` to start simulating.*

---

## 🔮 Future Roadmap
-   [ ] **Salary Projection Models**: Integrating real-world salary bands (Levels.fyi data).
-   [ ] **Industry-Specific Simulations**: Tech vs. Finance vs. Healthcare tracks.
-   [ ] **User Accounts**: Save and share simulation runs.

---

## 👨‍💻 Author
**Yashwanth Ponnam**  
*Building systems that model the real world.*  
[GitHub Profile](https://github.com/Yash55-max)
