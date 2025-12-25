# Self-Healing Microservice Architecture

A cloud-native Node.js application demonstrating **Fault Tolerance** and **Automated Orchestration** using Kubernetes. 

## 🚀 The Problem
In production, applications can hang, crash, or enter a "zombie" state (running but not responding). Traditionally, this required manual intervention from a DevOps engineer.

## 🛠️ The Solution
This project implements a **Self-Healing System**. Using Kubernetes **Liveness Probes**, the infrastructure monitors the application's internal health. If the app becomes "unhealthy," the orchestrator automatically terminates and replaces the failing instance without any downtime for the end-user.

## 🏗️ Tech Stack
- **Runtime:** Node.js (Express)
- **Containerization:** Docker
- **Orchestration:** Kubernetes (K8s)
- **Deployment:** Minikube

## 📂 Project Structure
- `index.js`: Node.js API with health-check logic and failure simulation.
- `Dockerfile`: Multi-stage build for a lightweight Alpine-based container.
- `k8s/deployment.yaml`: Kubernetes manifest defining 3 replicas and liveness probes.

## 🕹️ Features
- **Automated Recovery:** Kubernetes detects 500 errors and restarts the container.
- **Load Balancing:** A K8s Service distributes traffic across 3 healthy replicas.
- **Chaos Engineering:** Dedicated routes (`/fail` and `/crash`) to test system resilience.

## 📈 Impact
1. Zero Downtime: Demonstrated 100% availability     even during simulated logic failures.
2. Scalability: Easily scalable from 3 to 100+ replicas via the YAML configuration.

## Before starting, ensure you have the following installed:##
1. Docker Desktop (Keep it running)
2. Minikube & kubectl
3. Node.js (Optional, for local linting)

## 🛠️ How to Run

## 1. Start the local Kubernetes cluster:In vs code terminal
minikube start
# Enable the dashboard to see the UI/frontend :
minikube dashboard

## 2. Build the Image
# Point terminal to Minikube
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
# Build the image
docker build -t node-health-app:v1 .

## 3. Deploy to Kubernetes
# Apply the deployment and service
kubectl apply -f k8s/deployment.yaml
# Check if pods are ready (Wait for 'Running' status)
kubectl get pods -w

## 4. Access Frontend Dashboard 
# This command will automatically open your browser
minikube service node-service


