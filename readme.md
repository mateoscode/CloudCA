
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

## Cost Analysis

This application uses serverless and managed Google Cloud services, resulting in minimal operating costs. All services remain within their respective free tiers for typical coursework usage.
| Service | Pricing Model | Expected Cost |
|-------|---------------|---------------|
| Cloud Run         | $0.000018 per vCPU-second, $0.000002 per GiB-second | $0 – $1 / month |
| Firestore         | Free tier: 1 GiB storage, reads/writes per day      | $0 |
| Artifact Registry | Up to 0.5 GB free, then $0.10/GB/month              | $0 |


Overall, the estimated monthly cost of hosting this application is between $0 and $1, making it suitable for small-scale academic use.


AI tool usage
i used chatgpt to help structure the readme report and copilot to help me with the deployment 
