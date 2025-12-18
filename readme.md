
# Cloud Computing CA1 – Cloud Run & Firestore App

This repo contains a cloud-native Node.js application deployed on **Google Cloud Platform (GCP)**. The project demonstrates all mandatory CA1 requirements: serverless compute (**Cloud Run**), managed NoSQL storage (**Firestore**), CI/CD automation (**Cloud Build**), secure secrets (**Secret Manager**), and container distribution (**Artifact Registry**).

---

## ✅ Core Requirements Checklist

### 1. Google Cloud Services
- **Compute** – Cloud Run hosts the containerized Node.js service and scales from 0→100 instances automatically.
- **Database** – Firestore stores submitted credentials in the `logintest` collection.
- **Supporting services** – Cloud Build (CI/CD), Artifact Registry (images), and Secret Manager (credentials) round out the infrastructure.

### 2. Automated Deployment Pipeline
- Every push to `main` triggers Cloud Build via `cloudbuild.yaml`.
- Pipeline stages: **Build** Docker image → **Push** to Artifact Registry → **Deploy** to Cloud Run with secrets.
- No manual `gcloud run deploy` commands are required—the trigger handles everything.

### 3. Infrastructure Configuration
- [Dockerfile](Dockerfile) packages the Node.js app on top of `node:20-alpine`.
- [cloudbuild.yaml](cloudbuild.yaml) defines the CI/CD steps and substitutions.
- Cloud Run keeps scaling/invocation settings declarative; credentials arrive only through env vars provided by Secret Manager.

### 4. Source Control & Documentation
- Code, Dockerfile, and pipeline config all live in the public GitHub repo `mateoscode/CloudCA`.
- This README documents the architecture, IAM, deployment flow, and testing steps.

---

## 🧱 Architecture Overview
- **Frontend** – Static HTML/CSS form (`home.html`) served by Node.js.
- **Backend** – `server.js` (vanilla HTTP server) exposes `GET /` and `POST /submit`.
- **Database** – Firestore collection `logintest` persists `email`, `password`, and timestamps.
- **Secrets** – `firestore-key` in Secret Manager, injected as `FIREBASE_CREDENTIALS`.
- **Deployment** – Cloud Build → Artifact Registry → Cloud Run (region `europe-west1`).

---

## ⚙️ Local Development
```bash
# 1. Clone
git clone https://github.com/mateoscode/CloudCA.git
cd cloudCompCA

# 2. Credentials (ignored by git)
cp /path/to/service-account.json firebase-key.json

# 3. Install & run
npm install
npm start
# open http://localhost:8080
```

---

## ☁️ Cloud Setup & Deployment

### One-time GCP provisioning
1. **Artifact Registry**
   ```bash
   gcloud artifacts repositories create cloud-run \
       --location=europe-west1 \
       --repository-format=docker
   ```
2. **Secret Manager**
   ```bash
   gcloud secrets create firestore-key --replication-policy="automatic"
   gcloud secrets versions add firestore-key --data-file=firebase-key.json
   ```
3. **IAM grants**
   - Choose a dedicated **build service account** and grant it:
     - `roles/run.admin`
     - `roles/artifactregistry.writer`
     - `roles/secretmanager.secretAccessor`
     - `roles/iam.serviceAccountUser` on the Cloud Run **runtime** service account
   - Give the **runtime service account** (default: `PROJECT_NUMBER-compute@developer.gserviceaccount.com` or your custom SA) `roles/secretmanager.secretAccessor` on the `firestore-key` secret.
4. **Connect GitHub to Cloud Build**
   1. Console → *Cloud Build → Triggers → Manage repositories → Connect repository*.
   2. Authorize the GitHub App and pick `mateoscode/cloud-comp-ca` (or your fork).
   3. Create trigger `cloudcompca-deploy` watching `^main$` and pointing to `cloudbuild.yaml`.

### Deploy via Cloud Build
Once the trigger exists, any push to `main` executes:
1. **Build image** `$_REGION-docker.pkg.dev/$PROJECT_ID/$_REPOSITORY/$_IMAGE:$SHORT_SHA`
2. **Push image** to Artifact Registry
3. **Deploy** to Cloud Run with `--set-secrets FIREBASE_CREDENTIALS=firestore-key:latest`

Monitor progress under *Cloud Build → History* and confirm new revisions in *Cloud Run → Services*.

---

## 🔐 Security Highlights
- `.gitignore` keeps `firebase-key.json` and other sensitive files out of source control.
- Secret Manager supplies credentials only at runtime; nothing is baked into the container.
- IAM follows least privilege with separate build/runtime service accounts.

---

## 📡 API Endpoints
| Method | Path      | Description                                       |
|--------|-----------|---------------------------------------------------|
| GET    | `/`       | Serves `home.html` (form UI).
| POST   | `/submit` | Accepts JSON or form data and writes to Firestore. |

---

## 🧰 Tech Stack
- Node.js 20
- Docker / Artifact Registry
- Google Cloud Run
- Google Cloud Firestore
- Google Cloud Build
- Google Cloud Secret Manager

---

## 📄 Submission Notes
- Project ID: `cloudcompcagc`
- Region: `europe-west1`
- Firestore collection: `logintest`
- Provide the zipped repo (minus `firebase-key.json`) via Moodle per assignment requirements.

### 3. Infrastructure Configuration
*   **Declarative Config**:
    *   `Dockerfile`: Optimized multi-stage build using `node:20-alpine` for minimal footprint.
    *   `cloudbuild.yaml`: Defines the entire build infrastructure.
*   **Scaling**: Cloud Run is configured to automatically scale instances based on traffic (default 0-100 instances).
*   **Security**: Minimal IAM roles are used. Credentials are injected strictly at runtime via Secret Manager environment variables.

### 4. Source Control & Documentation
*   **GitHub**: All source code and configuration (excluding secrets) are hosted in this public repository.
*   **Documentation**: This file serves as the comprehensive guide for architecture and deployment.

---

## 🛠️ Architecture

*   **Frontend**: HTML5/CSS3 (served via Node.js).
*   **Backend**: Node.js (Vanilla HTTP Server).
*   **Database**: Firestore (Collection: `logintest`).
*   **CI/CD**: Cloud Build triggers on GitHub Push -> Artifact Registry -> Cloud Run.

---

## 🚀 Setup & Deployment Guide

### Prerequisites
*   Google Cloud Platform Project.
*   `gcloud` CLI installed and authenticated.

### Local Development
To run the project on your machine:
```bash
# 1. Clone
git clone <repo-url>
cd cloudCompCA

# 2. Add Keys
# Place your 'firebase-key.json' in the root folder.
# (This file is ignored by git for security)

# 3. Install
npm install

# 4. Run
npm start
```
Access the app at `http://localhost:8080`.

### Cloud Deployment (One-Time Setup)

Since the code uses secure infrastructure, you must provision these resources once:

**1. Create Artifact Registry**
```bash
gcloud artifacts repositories create cloud-run \
    --location=europe-west1 \
    --repository-format=docker \
    --description="App Repository"
```

<<<<<<< HEAD
*   Node.js
*   Docker
*   Google Cloud Run
*   Google Cloud Firestore
*   Google Cloud Build
*   Google Artifact Registry
=======
**2. Configure Secrets**
```bash
gcloud secrets create firestore-key --replication-policy="automatic"
gcloud secrets versions add firestore-key --data-file="./firebase-key.json"
```

**3. Grant Permissions**
The build system needs to read the secret to verify it, and the app needs it to run.
```bash
# Grant specific access to Cloud Build & Cloud Run Service Accounts
# Replace [PROJECT_NUMBER] with your project number (found in Dashboard)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

**4. Create Trigger**
Go to **Cloud Build > Triggers** in the Console and connect this GitHub repository.

---

## 🔒 Security Features
*   **.dockerignore**: Ensures local sensitive files (`firebase-key.json`, `.env`) are never baked into the container image.
*   **Secret Manager**: Credentials are mounted only in memory during runtime.
*   **Least Privilege**: The application runs with a specific service account identity.

## 📦 Submission Details
This repository connects to GCP Project ID: `[YOUR-PROJECT-ID]`.
Region: `europe-west1`.
>>>>>>> d3db4a1 (working final)
